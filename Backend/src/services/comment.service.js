const { pool } = require('../config/postgres');
const HTTP_STATUS = require('../constants/httpStatus');
const { ERROR_MESSAGES, COMMENT_MESSAGES } = require('../constants/message');
const createError = require ('../utils/createError');

const CommentService = {
  createComment: async ({ userId, eventId, artworkId, content, parentId = null }) => {
    if (!eventId && !artworkId) throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
    const values= [userId, eventId || null, artworkId || null, content, parentId || null];
    const query = `
      INSERT INTO comments (user_id, event_id, artwork_id, content, parent_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, content, created_at, parent_id, like_count
    `;
    const res = await pool.query(query, values);
    const newComment = res.rows[0];
    const userRes = await pool.query('SELECT full_name, avatar_url FROM users WHERE id = $1', [userId]);
    return {
      ...newComment,
      user: userRes.rows[0],
      is_liked_by_me: false
    };
  },

  getComments: async ({ eventId, artworkId, userId, page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;
    let condition = '';
    const params = [userId || null, limit, offset];
    if (eventId) {
        condition = 'c.event_id = $4';
        params.push(eventId);
    } else {
        condition = 'c.artwork_id = $4';
        params.push(artworkId);
    }
    const query = `
      SELECT 
        c.id, c.content, c.created_at, c.like_count, c.is_pinned,
        u.full_name, u.role,
        (SELECT COUNT(*) FROM comments r WHERE r.parent_id = c.id) as reply_count,
        CASE WHEN l.user_id IS NOT NULL THEN TRUE ELSE FALSE END as is_liked_by_me
      FROM comments c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN comment_likes l ON c.id = l.comment_id AND l.user_id = $1
      WHERE ${condition} AND c.parent_id IS NULL
      ORDER BY c.is_pinned DESC, c.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const res = await pool.query(query, params);
    return res.rows;
  },

  getReplies: async ({ commentId, userId }) => {
    const query = `
      SELECT 
        c.id, c.content, c.created_at, c.like_count,
        u.full_name, u.role,
        CASE WHEN l.user_id IS NOT NULL THEN TRUE ELSE FALSE END as is_liked_by_me
      FROM comments c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN comment_likes l ON c.id = l.comment_id AND l.user_id = $2
      WHERE c.parent_id = $1
      ORDER BY c.created_at ASC
    `;
    const res = await pool.query(query, [commentId, userId || null]);
    return res.rows;
  },

  toggleLikeComment: async (userId, commentId) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const checkRes = await client.query('SELECT * FROM comment_likes WHERE user_id = $1 AND comment_id = $2', [userId, commentId]);
      let isLiked = false;
      let newCount = 0;
      if (checkRes.rows.length > 0) {
        await client.query('DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2', [userId, commentId]);
        const r = await client.query('UPDATE comments SET like_count = like_count - 1 WHERE id = $1 RETURNING like_count', [commentId]);
        newCount = r.rows[0].like_count;
      } else {
        await client.query('INSERT INTO comment_likes (user_id, comment_id) VALUES ($1, $2)', [userId, commentId]);
        const r = await client.query('UPDATE comments SET like_count = like_count + 1 WHERE id = $1 RETURNING like_count', [commentId]);
        newCount = r.rows[0].like_count;
        isLiked = true;
      }
      await client.query('COMMIT');
      return { is_liked: isLiked, like_count: newCount };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  deleteComment: async (userId, commentId, isAdmin = false) => {
    if (isAdmin) {
      await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);
      return true;
    }
    const res = await pool.query(
      'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING id', 
      [commentId, userId]
    );
    if (res.rowCount === 0) throw createError(COMMENT_MESSAGES.DELETE_ERR, HTTP_STATUS.INTERNAL_SERVER);
    return true;
  },

  pinComment: async (commentId) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const targetRes = await client.query(
          'SELECT event_id, artwork_id FROM comments WHERE id = $1', 
          [commentId]
      );
      if (targetRes.rows.length === 0) throw new Error('Comment không tồn tại');
      const { event_id, artwork_id } = targetRes.rows[0];
      if (event_id) {
          await client.query(
              'UPDATE comments SET is_pinned = FALSE WHERE event_id = $1', 
              [event_id]
          );
      } else if (artwork_id) {
          await client.query(
              'UPDATE comments SET is_pinned = FALSE WHERE artwork_id = $1', 
              [artwork_id]
          );
      }
      await client.query(
        'UPDATE comments SET is_pinned = TRUE WHERE id = $1', 
        [commentId]
      );
      await client.query('COMMIT');
      return true;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
};

module.exports = CommentService;