const { pool } = require('../config/postgres');
const HTTP_STATUS = require('../constants/httpStatus');
const { ARTWORK_MESSAGES, COLLECTION_MESSAGES } = require('../constants/message');
const createError = require ('../utils/createError');

const CollectionService = {
  createCollection: async (userId, { name, is_public }) => {
    const query = `
      INSERT INTO collections (user_id, name, is_public)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const res = await pool.query(query, [userId, name, is_public]);
    return res.rows[0];
  },
  
  getMyCollections: async (userId) => {
    const query = `
      SELECT 
        c.id, c.name, c.is_public, c.created_at,
        COUNT(ci.artwork_id)::int as item_count,
        (
          SELECT a.media_url 
          FROM collection_items ci2 
          JOIN artworks a ON ci2.artwork_id = a.id 
          WHERE ci2.collection_id = c.id 
          ORDER BY ci2.added_at DESC 
          LIMIT 1
        ) as cover_image
      FROM collections c
      LEFT JOIN collection_items ci ON c.id = ci.collection_id
      WHERE c.user_id = $1
      GROUP BY c.id
      ORDER BY c.created_at DESC;
    `;
    const res = await pool.query(query, [userId]);
    return res.rows;
  },

  getCollectionDetail: async (collectionId, currentUserId) => {
    const colRes = await pool.query('SELECT * FROM collections WHERE id = $1', [collectionId]);
    const collection = colRes.rows[0];
    if (!collection) throw createError(COLLECTION_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    if (!collection.is_public && collection.user_id !== currentUserId) throw createError(COLLECTION_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    const query = `
      SELECT a.id, a.title, a.slug, a.media_url, a.artist_display_name, ci.added_at
      FROM collection_items ci
      JOIN artworks a ON ci.artwork_id = a.id
      WHERE ci.collection_id = $1
      ORDER BY ci.added_at DESC
    `;
    const itemsRes = await pool.query(query, [collectionId]);
    return { ...collection, items: itemsRes.rows };
  },

  addArtwork: async (userId, collectionId, artworkId) => {
    const checkOwner = await pool.query(
      'SELECT id FROM collections WHERE id = $1 AND user_id = $2',
      [collectionId, userId]
    );
    if (checkOwner.rows.length === 0) throw createError(COLLECTION_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    const checkArt = await pool.query('SELECT id FROM artworks WHERE id = $1', [artworkId]);
    if (checkArt.rows.length === 0) throw createError(ARTWORK_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    const query = `
      INSERT INTO collection_items (collection_id, artwork_id)
      VALUES ($1, $2)
      ON CONFLICT (collection_id, artwork_id) DO NOTHING
    `;
    await pool.query(query, [collectionId, artworkId])
    return { message: COLLECTION_MESSAGES.ADDED };
  },

  removeArtwork: async (userId, collectionId, artworkId) => {
    const query = `
      DELETE FROM collection_items 
      WHERE collection_id = $1 AND artwork_id = $2
      AND collection_id IN (SELECT id FROM collections WHERE user_id = $3)
    `;
    const res = await pool.query(query, [collectionId, artworkId, userId]);
    if (res.rowCount === 0) {
    }
    return { message: COLLECTION_MESSAGES.DELETEART };
  },

  deleteCollection: async (userId, collectionId) => {
    const query = `
      DELETE FROM collections 
      WHERE id = $1 AND user_id = $2
    `;
    const res = await pool.query(query, [collectionId, userId]);
    if (res.rowCount === 0) throw createError(COLLECTION_MESSAGES.DELETEERR);
    return { message: COLLECTION_MESSAGES.DELETED };
  },
  
  updateCollection: async (userId, collectionId, { name, is_public }) => {
    const query = `
        UPDATE collections
        SET name = COALESCE($1, name), 
            is_public = COALESCE($2, is_public)
        WHERE id = $3 AND user_id = $4
        RETURNING *
    `;
    const res = await pool.query(query, [name, is_public, collectionId, userId]);
    if (res.rows.length === 0) throw createError(COLLECTION_MESSAGES.UPDATEERR);
    return res.rows[0];
  }
};

module.exports = CollectionService;