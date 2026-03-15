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

const parseAttributesString = (str) => {
  if (!str || typeof str !== 'string') return {};
  const result = {};
  const parts = str.split('---');
  parts.forEach(part => {
    const separatorIndex = part.indexOf(':');
    if (separatorIndex > 0) {
      const key = part.slice(0, separatorIndex).trim().toLowerCase();
      const value = part.slice(separatorIndex + 1).trim();
      if (key && value) {
        result[key] = value;
      }
    }
  });
  return result;
};

const stringifyAttributes = (obj) => {
  if (!obj) return "";
  const finalObj = (obj instanceof Map) ? Object.fromEntries(obj) : obj;
  return Object.entries(finalObj)
    .map(([key, value]) => {
      const displayKey = key.charAt(0).toUpperCase() + key.slice(1);
      return `${displayKey}: ${value}`;
    })
    .join(' --- ');
};

const ArtworkService = {
  createArtwork: async (data) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let finalSlug = "";
      if (data.slug && data.slug.trim() !== '') {
        finalSlug = slugify(data.slug);
      } else {
        finalSlug = `${slugify(data.title)}-${generateUtils.randomString(5)}`;
      }
      const queryPG = `
            INSERT INTO artworks (
                title, slug, artist_id, artist_display_name, 
                media_url, media_type, public_id, status, 
                description, year 
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id;
        `;
      const finalArtistId = (data.artist_id === "" || data.artist_id === "null" || !data.artist_id) ? null : data.artist_id;
      const values = [
        data.title,
        finalSlug,
        finalArtistId,
        data.artist_display_name,
        data.media_url,
        data.media_type,
        data.public_id,
        data.status,
        data.description || '',
        data.year ?? new Date().getFullYear()
      ];
      const resPG = await client.query(queryPG, values);
      const newArtworkId = resPG.rows[0].id;
      if (data.category_ids && data.category_ids.length > 0) {
        const validCats = data.category_ids
          .map(id => parseInt(id))
          .filter(id => !isNaN(id));

        if (validCats.length > 0) {
          await client.query(`
                    INSERT INTO artwork_categories (artwork_id, category_id)
                    SELECT $1, unnest($2::int[])
                    ON CONFLICT DO NOTHING;
                `, [newArtworkId, validCats]);
        }
      }
      const attributesMap = parseAttributesString(data.attributes_text);
      await ArtworkDetail.create({
        artwork_id: String(newArtworkId),
        attributes: attributesMap || {},
        three_d_config: data.three_d_config ? data.three_d_config : undefined,
        annotations: data.annotations || []
      });
      await client.query('COMMIT');
      clearCachePattern('artworks:list:*');
      return { id: newArtworkId, ...data, slug: finalSlug };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  getArtworks: async ({ page = 1, limit = 20, category_ids, keyword }) => {
    const catPart = category_ids ? `cat_${category_ids}` : 'cat_all';
    const keyPart = keyword ? `k_${slugify(keyword)}` : 'k_none';
    const cacheKey = `artworks:list:${catPart}:${keyPart}:p${page}:l${limit}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);
    const offset = (page - 1) * limit;
    const params = [];
    let paramIndex = 1;
    let query = `
      SELECT a.id, a.title, a.slug, a.media_url, a.artist_display_name, a.created_at, a.year
      FROM artworks a
    `;
    if (category_ids) {
      query += ` JOIN artwork_categories ac ON a.id = ac.artwork_id `;
    }
    let conditions = [`a.status = 'published'`];
    if (category_ids) {
      conditions.push(`ac.category_id = $${paramIndex}`);
      params.push(category_ids);
      paramIndex++;
    }
    if (keyword) {
      conditions.push(`a.search_vector @@ plainto_tsquery('simple', unaccent($${paramIndex}))`);
      params.push(keyword);
      paramIndex++;
    }
    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }
    if (keyword) {
      query += ` ORDER BY ts_rank(a.search_vector, plainto_tsquery('simple', unaccent($${paramIndex - 1}))) DESC `;
    } else {
      query += ` ORDER BY a.created_at DESC `;
    }
    const countParams = [...params];
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1} `;
    params.push(limit, offset);
    const { rows } = await pool.query(query, params);
    let countQuery = `SELECT COUNT(DISTINCT a.id) FROM artworks a`;
    if (category_ids) countQuery += ` JOIN artwork_categories ac ON a.id = ac.artwork_id`;
    if (conditions.length > 0) {
      countQuery += ` WHERE ` + conditions.join(' AND ');
    }
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
    const query = `
        SELECT 
            a.id, a.title, a.slug, a.media_url, a.artist_id, a.description, a.artist_display_name, 
            a.status, a.created_at, a.year,
            COALESCE(
                json_agg(
                    json_build_object('id', c.id, 'name', c.name, 'layout_type', c.layout_type)
                ) FILTER (WHERE c.id IS NOT NULL), '[]'
            ) as categories
        FROM artworks a
        LEFT JOIN artwork_categories ac ON a.id = ac.artwork_id
        LEFT JOIN categories c ON ac.category_id = c.id
        GROUP BY a.id
        HAVING ($3::text IS NULL OR bool_or(c.layout_type = $3))
        ORDER BY a.created_at DESC
        LIMIT $1 OFFSET $2
    `;
    const countQuery = `
        SELECT COUNT(DISTINCT a.id) 
        FROM artworks a
        LEFT JOIN artwork_categories ac ON a.id = ac.artwork_id
        LEFT JOIN categories c ON ac.category_id = c.id
        WHERE ($1::text IS NULL OR c.layout_type = $1)
    `;
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

  getArtworkBySlug: async (slug) => {
    const cacheKey = `artwork:detail:${slug}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);
    const artRes = await pool.query(`SELECT * FROM artworks WHERE slug = $1`, [slug]);
    const artwork = artRes.rows[0];
    if (!artwork) return null;
    const [catRes, detailMongo] = await Promise.all([
      pool.query(`
        SELECT c.id, c.name, c.slug, c.layout_type
        FROM categories c JOIN artwork_categories ac ON c.id = ac.category_id
        WHERE ac.artwork_id = $1
      `, [artwork.id]),
      ArtworkDetail.findOne({ artwork_id: String(artwork.id) }).lean()
    ]);
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
    const result = {
      ...artwork,
      categories: catRes.rows,
      extended_info: extendedInfo
    };
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 3600);
    return result;
  },

  getArtworkById: async (id) => {
    const queryPG = `
            SELECT 
                a.*,
                COALESCE(
                    array_agg(ac.category_id) FILTER (WHERE ac.category_id IS NOT NULL), 
                    '{}'
                ) AS category_ids
            FROM artworks a
            LEFT JOIN artwork_categories ac ON a.id = ac.artwork_id
            WHERE a.id = $1
            GROUP BY a.id;
        `;
    const { rows } = await pool.query(queryPG, [id]);
    if (rows.length === 0) throw createError(ARTWORK_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    const artworkData = rows[0];
    const artworkDetail = await ArtworkDetail.findOne({ artwork_id: String(id) }).lean();
    let attributesText = "";
    if (artworkDetail && artworkDetail.attributes) {
      attributesText = stringifyAttributes(artworkDetail.attributes);
    }
    return {
      ...artworkData,
      category_ids: artworkData.category_ids,
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
      const queryPG = `
        UPDATE artworks 
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
          updated_at = NOW()
        WHERE id = $11 RETURNING *;
      `;
      const finalArtistId = (updateData.artist_id === "" || updateData.artist_id === "null" || !updateData.artist_id) ? null : updateData.artist_id;
      const values = [
        updateData.title,
        updateData.slug,
        finalArtistId,
        updateData.artist_display_name,
        updateData.status,
        newMediaUrl,
        newPublicId,
        newMediaType,
        updateData.description,
        updateData.year,
        id
      ];
      await client.query(queryPG, values);
      if (updateData.category_ids !== undefined) {
        const parsedCategories = typeof updateData.category_ids === 'string' ? JSON.parse(updateData.category_ids) : updateData.category_ids;
        await client.query('DELETE FROM artwork_categories WHERE artwork_id = $1', [id]);
        if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
          const validCats = parsedCategories.map(c => parseInt(c)).filter(c => !isNaN(c));
          if (validCats.length > 0) {
            await client.query(`
                        INSERT INTO artwork_categories (artwork_id, category_id)
                        SELECT $1, unnest($2::int[])
                    `, [id, validCats]);
          }
        }
      }
      const mongoUpdateFields = {};
      if (updateData.attributes_text !== undefined) {
        mongoUpdateFields.attributes = parseAttributesString(updateData.attributes_text);
      }
      if (updateData.three_d_config) mongoUpdateFields.three_d_config = updateData.three_d_config;
      if (updateData.annotations !== undefined) { mongoUpdateFields.annotations = typeof updateData.annotations === 'string' ? JSON.parse(updateData.annotations) : updateData.annotations; };
      if (Object.keys(mongoUpdateFields).length > 0) {
        await ArtworkDetail.findOneAndUpdate(
          { artwork_id: String(id) },
          { $set: { ...mongoUpdateFields, updated_at: new Date() } },
          { upsert: true, new: true }
        );
      }
      await client.query('COMMIT');
      clearCachePattern('artworks:list:*');
      if (oldArt.slug) await redis.del(`artwork:detail:${oldArt.slug}`);
      if (oldImageToDelete) {
        deleteFromCloudinary(oldImageToDelete.id, oldImageToDelete.type)
          .catch(err => console.error('Lỗi xóa ảnh cũ Cloudinary:', err));
      }
      return { message: 'Updated thành công!' };
    } catch (error) {
      await client.query('ROLLBACK');
      if (updateData.file && updateData.file.filename) {
        deleteFromCloudinary(updateData.file.filename,
          updateData.file.mimetype.startsWith('video') ? 'video' : 'image'
        ).catch(() => { });
      }
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
      if (!art) {
        throw createError(ARTWORK_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }
      artToDelete = art;
      await client.query('DELETE FROM artworks WHERE id = $1', [id]);
      await ArtworkDetail.deleteOne({ artwork_id: String(id) });
      await client.query('COMMIT');
      clearCachePattern('artworks:list:*');
      if (artToDelete.slug) {
        await redis.del(`artwork:detail:${artToDelete.slug}`);
      }
      if (artToDelete.public_id) {
        deleteFromCloudinary(artToDelete.public_id, artToDelete.media_type)
          .catch(err => console.error('Lỗi xóa ảnh Cloudinary (không ảnh hưởng user):', err));
      }
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
      {
        $set: {
          three_d_config: threeDConfigData,
          updated_at: new Date()
        }
      },
      { new: true, upsert: true }
    );
    const res = await pool.query('SELECT slug FROM artworks WHERE id = $1', [artworkId]);
    if (res.rows[0]) {
      await redis.del(`artwork:detail:${res.rows[0].slug}`);
    }
    return updated.three_d_config;
  },

  updateAnnotations: async (artworkId, newAnnotation) => {
    const updated = await ArtworkDetail.findOneAndUpdate(
      { artwork_id: String(artworkId) },
      {
        $push: { annotations: newAnnotation },
        $set: { updated_at: new Date() }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );
    const res = await pool.query('SELECT slug FROM artworks WHERE id = $1', [artworkId]);
    if (res.rows[0]) {
      await redis.del(`artwork:detail:${res.rows[0].slug}`);
    }
    return updated.annotations;
  }
};

module.exports = ArtworkService;