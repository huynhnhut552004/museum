const { pool } = require('../config/postgres');
const HTTP_STATUS = require('../constants/httpStatus');
const { ERROR_MESSAGES } = require('../constants/message');
const createError = require('../utils/createError');

const LikeService = {
  toggleLike: async (userId, { eventId, artworkId }) => {
    if (!eventId && !artworkId) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let whereClause = '';
      const params = [userId];
      if (eventId) {
        whereClause = 'event_id = $2';
        params.push(eventId);
      } else {
        whereClause = 'artwork_id = $2';
        params.push(artworkId);
      }
      const checkQuery = `SELECT * FROM likes WHERE user_id = $1 AND ${whereClause}`;
      const checkRes = await client.query(checkQuery, params);
      let isLiked = false;
      if (checkRes.rows.length > 0) {
        await client.query(`DELETE FROM likes WHERE user_id = $1 AND ${whereClause}`, params);
        isLiked = false;
      } else {
        const insertQuery = `INSERT INTO likes (user_id, event_id, artwork_id) VALUES ($1, $2, $3)`;
        await client.query(insertQuery, [userId, eventId || null, artworkId || null]);
        isLiked = true;
      }
      await client.query('COMMIT');
      return { is_liked: isLiked };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  checkIsLiked: async (userId, { eventId, artworkId }) => {
    let whereClause = eventId ? 'event_id = $2' : 'artwork_id = $2';
    const params = [userId, eventId || artworkId];
    const res = await pool.query(`SELECT 1 FROM likes WHERE user_id = $1 AND ${whereClause}`, params);
    return res.rows.length > 0;
  },

  getUserLikes: async (userId, filterType = 'all') => {
    const artworkQuery =
      `SELECT 
        'artwork' AS type,
        a.id,
        a.slug,
        a.layout_type,
        a.title,
        a.artist_display_name AS author_name,
        a.media_url AS image_url,
        l.created_at AS liked_at
      FROM likes l
      INNER JOIN artworks a ON l.artwork_id = a.id
      WHERE l.user_id = $1`;
    const eventQuery =
      `SELECT 
        'event' AS type,
        e.id,
        e.slug,
        NULL::text AS layout_type,
        e.title,
        NULL AS author_name, -- Event không có tác giả cụ thể trong schema này
        e.banner_url AS image_url,
        l.created_at AS liked_at
      FROM likes l
      INNER JOIN events e ON l.event_id = e.id
      WHERE l.user_id = $1`;
    let finalQuery = '';
    if (filterType === 'artwork') {
      finalQuery = `${artworkQuery} ORDER BY liked_at DESC`;
    } else if (filterType === 'event') {
      finalQuery = `${eventQuery} ORDER BY liked_at DESC`;
    } else {
      finalQuery = `${artworkQuery} UNION ALL ${eventQuery} ORDER BY liked_at DESC`;
    }
    try {
      const { rows } = await pool.query(finalQuery, [userId]);
      return rows;
    } catch (error) {
      throw createError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

module.exports = LikeService;