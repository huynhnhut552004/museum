const {pool} = require('../config/postgres');
const {HTTP_STATUS} = require('../constants/httpStatus');
const { ERROR_MESSAGES } = require('../constants/message');
const createError = require ('../utils/createError');

const SubmissionService = {
    postSubmission: async (data) => {
        try {
            const query = `INSERT INTO submission(
            name, email, purpose, description, status
        ) VALUES ($1, $2, $3, $4, $5)`;
            const values = [
                data.name,
                data.email,
                data.purpose,
                data.desc,
                data.status
            ];
            await pool.query(query, values);
        }
        catch (err) {
            throw err;
        }
    },

    getSubmission: async ({ page = 1, limit = 20, status, email }) => {
    const pageInt = Math.max(1, parseInt(page, 10) || 1);
    const limitInt = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageInt - 1) * limitInt;

    let query = `SELECT * FROM submission WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) FROM submission WHERE 1=1`;
    const params = [];
    if (status && status !== 'all'){
        params.push(status);
        query += ` AND status = $${params.length}`;
        countQuery += ` AND status = $${params.length}`;
    }
    if (email) {
        params.push(email);
        query += ` AND email = $${params.length}`;
        countQuery += ` AND email = $${params.length}`;
    }
    const countRes = await pool.query(countQuery, params);
    const totalItems = parseInt(countRes.rows[0].count);
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limitInt, offset);
    const res = await pool.query(query, params);
    return {
        data: res.rows,
        pagination: {
            page: pageInt,
            limit: limitInt,
            totalItems,
            totalPages: Math.ceil(totalItems / limitInt)
        }
    };
},

    markAsRead: async (id) => {
    await pool.query('UPDATE submission SET is_read = NOT is_read WHERE id = $1', [id]);
    return true;
  },

    deleteSubmission: async (id) => {
        await pool.query('DELETE FROM submission WHERE id = $1', [id]);
        return true;
    }
}

module.exports= SubmissionService;