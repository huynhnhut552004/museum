const { pool } = require('../config/postgres');
const HTTP_STATUS = require('../constants/httpStatus');
const { ERROR_MESSAGES } = require('../constants/message');
const createError = require ('../utils/createError');

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
  }
};
module.exports = LikeService;