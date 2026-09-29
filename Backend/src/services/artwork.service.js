const { pool } = require('../config/postgres');
const redis = require('../config/redis');
const slugify = require('../utils/slugify');
const ArtworkDetail = require('../models/mongo/ArtworkDetail');
const { deleteFromCloudinary } = require('../utils/cloudinaryHelper');
const generateUtils = require("../utils/generate");
const { clearCachePattern } = require('../utils/redisHelper');
const { HTTP_STATUS } = require('../constants/httpStatus');
const createError = require('../utils/createError');
const { ARTWORK_MESSAGES } = require('../constants/message');
const aiQueue = require('../queues/ai.queue');
const { syncSingleArtwork, deleteArtworkFromAlgolia } = require("../services/algoliaSync.service");

const parseAttributesString = (str) => {
  if (!str || typeof str !== 'string') return [];
  return str.split(';').map(val => val.trim()).filter(val => val.length > 0);
};

const stringifyAttributes = (obj) => {
  if (!obj || typeof obj !== 'object') return "";
  const finalObj = obj instanceof Map ? Object.fromEntries(obj) : obj;
  if (finalObj.vi && typeof finalObj.vi === 'object') {
    return Object.values(finalObj.vi)
      .flatMap(value => Array.isArray(value) ? value : [value])
      .map(value => String(value).trim())
      .filter(Boolean)
      .map(value => `${value};`)
      .join('\n');
  }
  return Object.values(finalObj)
    .flatMap(value => Array.isArray(value) ? value : [value])
    .map(value => String(value).trim())
    .filter(Boolean)
    .map(value => `${value};`)
    .join('\n');
};

const ArtworkService = {
  createArtwork: async (data) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const finalArtistId = (data.artist_id === "" || data.artist_id === "null" || !data.artist_id) ? null : data.artist_id;
      let finalSlug = "";
      if (data.slug && data.slug.trim() !== '') {
        finalSlug = slugify(data.slug);
      } else {
        if (finalArtistId == null) {
          finalSlug = slugify(data.title);
        } else {
          finalSlug = `${slugify(data.title)}-${generateUtils.randomString(5)}`;
        }
      }
      const queryPG =
        `INSERT INTO artworks (
            title, slug, artist_id, artist_display_name, 
            media_url, media_type, public_id, status, 
            description, year, layout_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id;`;
      const values = [
        data.title,
        finalSlug,
        finalArtistId,
        data.artist_display_name,
        data.media_url,
        data.media_type,
        data.public_id,
        'draft',
        data.description || '',
        data.year ?? null,
        data.layout_type || 'classic'
      ];
      const resPG = await client.query(queryPG, values);
      const newArtworkId = resPG.rows[0].id;
      const userHints = parseAttributesString(data.attributes_text);
      await ArtworkDetail.create({
        artwork_id: String(newArtworkId),
        attributes: {},
        three_d_config: data.three_d_config ? data.three_d_config : undefined,
        annotations: data.annotations || []
      });
      await client.query('COMMIT');
      clearCachePattern('artworks:list:*');
      await aiQueue.add('process-artwork', {
        artworkId: newArtworkId,
        mediaUrl: data.media_url,
        title: data.title,
        artist: data.artist_display_name,
        layout_type: data.layout_type || 'classic',
        artistId: finalArtistId,
        existingDescription: data.description || '',
        existingDescriptionEn: data.description_en || '',
        existingTitleEn: data.title_en || '',
        userHints: userHints
      },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: true
        }
      );
      return {
        id: newArtworkId,
        ...data,
        slug: finalSlug,
        status: 'draft',
        message: 'Tác phẩm đã lưu và đang chờ AI xử lý'
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  retryAIArtwork: async ({ artworkId, media_url, title, artist_name, layout_type, artistId, desc }) => {
    await aiQueue.add('process-artwork', {
      artworkId: artworkId,
      mediaUrl: media_url,
      title: title,
      artist: artist_name,
      layout_type: layout_type || 'classic',
      artistId: artistId,
      existingDescription: desc || ''
    },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true
      }
    );
    return {
      message: "Đã đưa tác phẩm vào hàng đợi AI để xử lý lại."
    };
  },

  getArtworks: async ({ page = 1, limit = 20, attributes, keyword, artist_name, layout, lang = 'vi' }) => {
    const attrPart = attributes ? `attr_${Buffer.from(JSON.stringify(attributes)).toString('base64').substring(0, 10)}` : 'attr_none';
    const artPart = artist_name ? `art_${artist_name.replace(/\s+/g, '').toLowerCase()}` : 'art_none';
    const keyPart = keyword ? `k_${slugify(keyword)}` : 'k_none';
    const layoutPart = layout ? `lay_${layout}` : 'lay_all';
    const cacheKey = `artworks:list:${artPart}:${attrPart}:${keyPart}:${layoutPart}:lang_${lang}:p${page}:l${limit}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);
    let mongoArtworkIds = [];
    if (keyword) {
      const mongoResults = await ArtworkDetail.find({ $text: { $search: `"${keyword}"` } }, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } })
        .limit(200)
        .select('artwork_id')
        .lean();
      mongoArtworkIds = mongoResults.map(doc => String(doc.artwork_id));
    }
    const offset = (page - 1) * limit;
    const params = [];
    let paramIndex = 1;
    const vectorCol = lang === 'en' ? 'a.search_vector_en' : 'a.search_vector';
    let query =
      `SELECT a.id, a.title, a.title_en, a.slug, a.media_url, a.artist_display_name, a.created_at, a.year, a.layout_type, a.ai_attributes
    FROM artworks a`;
    let conditions = [`a.status = 'published'`];
    if (artist_name) {
      const noSpaceArtist = artist_name.replace(/\s+/g, '');
      conditions.push(`REPLACE(a.artist_display_name, ' ', '') ILIKE $${paramIndex}`);
      params.push(noSpaceArtist);
      paramIndex++;
    }
    if (attributes && Object.keys(attributes).length > 0) {
      conditions.push(`a.ai_attributes @> $${paramIndex}::jsonb`);
      params.push(JSON.stringify(attributes));
      paramIndex++;
    }
    if (layout) {
      conditions.push(`a.layout_type = $${paramIndex}`);
      params.push(layout);
      paramIndex++;
    }
    let keywordParamIndex = null;
    if (keyword) {
      keywordParamIndex = paramIndex;
      if (mongoArtworkIds.length > 0) {
        conditions.push(`(${vectorCol} @@ websearch_to_tsquery('simple', unaccent($${paramIndex})) OR a.id = ANY($${paramIndex + 1}::uuid[]))`);
        params.push(keyword, mongoArtworkIds);
        paramIndex += 2;
      } else {
        conditions.push(`(${vectorCol} @@ websearch_to_tsquery('simple', unaccent($${paramIndex})))`);
        params.push(keyword);
        paramIndex++;
      }
    }
    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }
    if (keyword && keywordParamIndex) {
      query += ` ORDER BY ts_rank(${vectorCol}, websearch_to_tsquery('simple', unaccent($${keywordParamIndex}))) DESC, a.created_at DESC `;
    } else {
      query += ` ORDER BY a.created_at DESC `;
    }
    const countParams = [...params];
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1} `;
    params.push(limit, offset);
    const { rows } = await pool.query(query, params);
    let countQuery = `SELECT COUNT(DISTINCT a.id) FROM artworks a`;
    if (conditions.length > 0) countQuery += ` WHERE ` + conditions.join(' AND ');
    const countRes = await pool.query(countQuery, countParams);
    const totalItems = parseInt(countRes.rows[0].count);
    const result = {
      data: rows,
      pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) }
    };
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);
    return result;
  },

  getArtworksForAdmin: async ({ page = 1, limit = 20, layout = null }) => {
    const offset = (page - 1) * limit;
    const query =
      `SELECT 
          a.id, a.title, a.slug, a.media_url, a.artist_id, a.description, a.artist_display_name, 
          a.status, a.created_at, a.year, a.layout_type, a.ai_attributes
      FROM artworks a
      WHERE ($3::text IS NULL OR a.layout_type = $3)
      ORDER BY a.created_at DESC
      LIMIT $1 OFFSET $2`;
    const countQuery =
      `SELECT COUNT(id) 
      FROM artworks a
      WHERE ($1::text IS NULL OR a.layout_type = $1)`;
    const { rows } = await pool.query(query, [limit, offset, layout]);
    const countRes = await pool.query(countQuery, [layout]);
    const totalItems = parseInt(countRes.rows[0].count);
    return {
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    };
  },

  searchArtworksForAdmin: async ({ page = 1, limit = 20, layout = null, keyword = '', lang = 'vi' }) => {
    const offset = (page - 1) * limit;
    const params = [];
    let paramIndex = 1;
    const vectorCol = lang === 'en' ? 'a.search_vector_en' : 'a.search_vector';
    let query =
      `SELECT 
          a.id, a.title, a.slug, a.media_url, a.artist_id, a.description, a.artist_display_name, 
          a.status, a.created_at, a.year, a.layout_type, a.ai_attributes
      FROM artworks a`;
    let conditions = [];
    let keywordParamIndex = null;
    if (layout) {
      conditions.push(`a.layout_type = $${paramIndex}`);
      params.push(layout);
      paramIndex++;
    }
    if (keyword) {
      keywordParamIndex = paramIndex;
      conditions.push(`(${vectorCol} @@ websearch_to_tsquery('simple', unaccent($${paramIndex})) OR a.title ILIKE $${paramIndex + 1} OR a.artist_display_name ILIKE $${paramIndex + 1})`);
      params.push(keyword, `%${keyword}%`);
      paramIndex += 2;
    }
    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }
    if (keyword && keywordParamIndex) {
      query += ` ORDER BY ts_rank(${vectorCol}, websearch_to_tsquery('simple', unaccent($${keywordParamIndex}))) DESC, a.created_at DESC `;
    } else {
      query += ` ORDER BY a.created_at DESC `;
    }
    const countParams = [...params];
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1} `;
    params.push(limit, offset);
    const { rows } = await pool.query(query, params);
    let countQuery = `SELECT COUNT(DISTINCT a.id) FROM artworks a`;
    if (conditions.length > 0) {
      countQuery += ` WHERE ` + conditions.join(' AND ');
    }
    const countRes = await pool.query(countQuery, countParams);
    const totalItems = parseInt(countRes.rows[0].count);
    return {
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    };
  },

  getRecommendedArtworks: async ({ artworkId, artist_name, layout_type, limit = 10 }) => {
    const noSpaceArtist = artist_name ? artist_name.replace(/\s+/g, '').toLowerCase() : null;
    const artistPart = noSpaceArtist || 'none';
    const layoutPart = layout_type || 'none';
    const cacheKey = `artworks:recommend:${artworkId}:${artistPart}:${layoutPart}:l${limit}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);
    const query =
      `SELECT a.id, a.title, a.slug, a.media_url, a.artist_display_name, a.created_at, a.year,a.layout_type,
    (
        CASE
            WHEN LOWER(REPLACE(a.artist_display_name, ' ', '')) = $2 THEN 50 ELSE 0
        END
    ) AS relevance_score
FROM artworks a
WHERE a.id != $1 AND a.status = 'published' AND a.layout_type = $3
ORDER BY relevance_score DESC, a.created_at DESC
LIMIT $4;`;
    const params = [artworkId, noSpaceArtist, layout_type, limit];
    const { rows } = await pool.query(query, params);
    const result = { data: rows };
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 3600);
    return result;
  },

  getArtworkBySlug: async (slug) => {
    const cacheKey = `artwork:detail:${slug}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);
    const artRes = await pool.query(`SELECT * FROM artworks WHERE slug = $1`, [slug]);
    const artwork = artRes.rows[0];
    if (!artwork) return null;
    const detailMongo = await ArtworkDetail.findOne({ artwork_id: String(artwork.id) }).lean();
    let attributesText = "";
    let extendedInfo = null;
    if (detailMongo) {
      attributesText = stringifyAttributes(detailMongo.attributes);
      extendedInfo = {
        attributes: detailMongo.attributes,
        attributes_text: attributesText,
        three_d_config: detailMongo.three_d_config,
        annotations: detailMongo.annotations
      };
    }
    const result = { ...artwork, extended_info: extendedInfo };
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 3600);
    return result;
  },

  getArtworkById: async (id) => {
    const queryPG = `SELECT * FROM artworks WHERE id = $1`;
    const { rows } = await pool.query(queryPG, [id]);
    if (rows.length === 0) throw createError(ARTWORK_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    const artworkData = rows[0];
    const artworkDetail = await ArtworkDetail.findOne({ artwork_id: String(id) }).lean();
    let attributesText = "";
    if (artworkDetail && artworkDetail.attributes) attributesText = stringifyAttributes(artworkDetail.attributes);
    return {
      ...artworkData,
      attributes: artworkDetail?.attributes || {},
      attributes_text: attributesText,
      three_d_config: artworkDetail?.three_d_config || null,
      annotations: artworkDetail?.annotations || []
    }
  },

  updateArtwork: async (id, updateData) => {
    const client = await pool.connect();
    let oldImageToDelete = null;
    try {
      await client.query('BEGIN');
      const oldArtRes = await client.query('SELECT * FROM artworks WHERE id = $1 FOR UPDATE', [id]);
      const oldArt = oldArtRes.rows[0];
      if (!oldArt) throw createError(ARTWORK_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      let newMediaUrl = oldArt.media_url;
      let newPublicId = oldArt.public_id;
      let newMediaType = oldArt.media_type;
      if (updateData.file) {
        newMediaUrl = updateData.file.path;
        newPublicId = updateData.file.filename;
        newMediaType = updateData.file.mimetype.startsWith('video') ? 'video' : 'image';
        if (oldArt.public_id) {
          oldImageToDelete = { id: oldArt.public_id, type: oldArt.media_type };
        }
      }
      const queryPG =
        `UPDATE artworks 
      SET 
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        artist_id = $3,
        artist_display_name = COALESCE($4, artist_display_name),
        status = COALESCE($5, status),
        media_url = $6, 
        public_id = $7, 
        media_type = $8, 
        description = COALESCE($9, description),
        year = COALESCE($10, year),
        layout_type = COALESCE($11, layout_type),
        title_en = COALESCE($12, title_en),            
        description_en = COALESCE($13, description_en),
        ai_attributes = COALESCE($14, ai_attributes),
        updated_at = NOW()
      WHERE id = $15 RETURNING *;`;
      const finalArtistId = (updateData.artist_id === "" || updateData.artist_id === "null" || !updateData.artist_id) ? null : updateData.artist_id;
      const finalSlug = (updateData.slug === "" || updateData.slug === "null" || !updateData.slug) ? null : slugify(updateData.slug);
      const values = [
        updateData.title,
        finalSlug,
        finalArtistId,
        updateData.artist_display_name,
        updateData.status,
        newMediaUrl,
        newPublicId,
        newMediaType,
        updateData.description,
        updateData.year,
        updateData.layout_type,
        updateData.title_en,
        updateData.description_en,
        updateData.ai_attributes ? JSON.stringify(updateData.ai_attributes) : null,
        id
      ];
      await client.query(queryPG, values);
      const mongoUpdateFields = {};
      if (updateData.attributes) {
        mongoUpdateFields.attributes = updateData.attributes;
      } else if (updateData.attributes_text !== undefined) {
        mongoUpdateFields.attributes = parseAttributesString(updateData.attributes_text);
      }
      if (updateData.three_d_config) mongoUpdateFields.three_d_config = updateData.three_d_config;
      if (updateData.annotations !== undefined) mongoUpdateFields.annotations = typeof updateData.annotations === 'string' ? JSON.parse(updateData.annotations) : updateData.annotations;
      if (Object.keys(mongoUpdateFields).length > 0) {
        await ArtworkDetail.findOneAndUpdate(
          { artwork_id: String(id) },
          { $set: { ...mongoUpdateFields, updated_at: new Date() } },
          { upsert: true, new: true }
        );
      }
      await client.query('COMMIT');
      const finalStatus = updateData.status || oldArt.status;
      if (finalStatus === 'published') {
        syncSingleArtwork(id).catch(err => console.error(`Lỗi cập nhật Algolia cho ID ${id}:`, err));
      } else {
        deleteArtworkFromAlgolia(id).catch(err => console.error(`Lỗi xóa Algolia cho ID ${id}:`, err));
      }
      clearCachePattern('artworks:list:*');
      if (oldArt.slug) await redis.del(`artwork:detail:${oldArt.slug}`);
      if (updateData.slug && updateData.slug !== oldArt.slug) await redis.del(`artwork:detail:${updateData.slug}`);
      if (oldImageToDelete) deleteFromCloudinary(oldImageToDelete.id, oldImageToDelete.type).catch(err => console.error('Lỗi xóa ảnh cũ Cloudinary:', err));
      return { message: 'Updated thành công!' };
    } catch (error) {
      await client.query('ROLLBACK');
      if (updateData.file && updateData.file.filename) deleteFromCloudinary(updateData.file.filename, updateData.file.mimetype.startsWith('video') ? 'video' : 'image').catch(() => { });
      throw error;
    } finally {
      client.release();
    }
  },

  deleteArtwork: async (id) => {
    const client = await pool.connect();
    let artToDelete = null;
    try {
      await client.query('BEGIN');
      const res = await client.query('SELECT public_id, media_type, slug FROM artworks WHERE id = $1', [id]);
      const art = res.rows[0];
      if (!art) throw createError(ARTWORK_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      artToDelete = art;
      await client.query('DELETE FROM artworks WHERE id = $1', [id]);
      await ArtworkDetail.deleteOne({ artwork_id: String(id) });
      await client.query('COMMIT');
      deleteArtworkFromAlgolia(id).catch(err => console.error(`Lỗi xóa Algolia cho ID ${id}:`, err));
      clearCachePattern('artworks:list:*');
      if (artToDelete.slug) await redis.del(`artwork:detail:${artToDelete.slug}`);
      clearCachePattern('artworks:list:*');
      if (artToDelete.slug) await redis.del(`artwork:detail:${artToDelete.slug}`);
      if (artToDelete.public_id) deleteFromCloudinary(artToDelete.public_id, artToDelete.media_type).catch(err => console.error('Lỗi xóa ảnh Cloudinary:', err));
      return { message: 'Xóa tác phẩm thành công!' };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  update3DConfig: async (artworkId, threeDConfigData) => {
    const updated = await ArtworkDetail.findOneAndUpdate(
      { artwork_id: String(artworkId) },
      { $set: { three_d_config: threeDConfigData, updated_at: new Date() } },
      { new: true, upsert: true }
    );
    const res = await pool.query('SELECT slug FROM artworks WHERE id = $1', [artworkId]);
    if (res.rows[0]) await redis.del(`artwork:detail:${res.rows[0].slug}`);
    return updated.three_d_config;
  },

  updateAnnotations: async (artworkId, newAnnotation) => {
    const updated = await ArtworkDetail.findOneAndUpdate(
      { artwork_id: String(artworkId) },
      { $push: { annotations: newAnnotation }, $set: { updated_at: new Date() } },
      { new: true, upsert: true, runValidators: true }
    );
    const res = await pool.query('SELECT slug FROM artworks WHERE id = $1', [artworkId]);
    if (res.rows[0]) await redis.del(`artwork:detail:${res.rows[0].slug}`);
    return updated.annotations;
  }
};

module.exports = ArtworkService;