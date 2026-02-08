const {pool} = require('../config/postgres');
const HTTP_STATUS = require('../constants/httpStatus');
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
                data.description,
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
        const params = [];
        if (status) {
            params.push(status);
        } else {
            throw createError(ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
        }
        let countQuery = `SELECT COUNT(*) FROM submission WHERE status = $1`;
        let query = `SELECT * FROM submission WHERE status = $1`;
        if (email) {
            params.push(email);
            query += ` AND email = $2`;
            countQuery += ` AND email = $2`;
        }
        const limitPlaceholder = `$${params.length + 1}`;
        const offsetPlaceholder = `$${params.length + 2}`;
        query += ` ORDER BY created_at DESC LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`;
        params.push(limitInt, offset);
        const res = await pool.query(query, params);
        const countRes = await pool.query(countQuery, params.slice(0, params.length - 2));
        const totalItems = parseInt(countRes.rows[0].count);
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
    await pool.query('UPDATE submission SET is_read = TRUE WHERE id = $1', [id]);
    return true;
  },

    deleteSubmission: async (id) => {
        await pool.query('DELETE FROM submission WHERE id = $1', [id]);
        return true;
    }
}

module.exports= SubmissionService;