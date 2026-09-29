const { pool } = require('../config/postgres');

const SubmissionService = {
    postSubmission: async (data) => {
        const query = `INSERT INTO submission(name, email, purpose, description, status) VALUES ($1, $2, $3, $4, $5)`;
        const values = [data.name, data.email, data.purpose, data.desc, data.status];
        await pool.query(query, values);
    },

    getSubmission: async ({ page = 1, limit = 20, status, email }) => {
        const pageInt = Math.max(1, parseInt(page, 10) || 1);
        const limitInt = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const offset = (pageInt - 1) * limitInt;
        let query = `SELECT * FROM submission WHERE 1=1`;
        let countQuery = `SELECT COUNT(*) FROM submission WHERE 1=1`;
        const params = [];
        if (status && status !== 'all') {
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
        return { data: res.rows, pagination: { page: pageInt, limit: limitInt, totalItems, totalPages: Math.ceil(totalItems / limitInt) } };
    },

    searchSubmissionsForAdmin: async ({ page = 1, limit = 20, status, email, keyword = '' }) => {
        const pageInt = Math.max(1, parseInt(page, 10) || 1);
        const limitInt = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const offset = (pageInt - 1) * limitInt;
        const params = [];
        let conditions = [];
        let paramIndex = 1;
        if (status && status !== 'all') {
            conditions.push(`status = $${paramIndex}`);
            params.push(status);
            paramIndex++;
        }
        if (email) {
            conditions.push(`email = $${paramIndex}`);
            params.push(email);
            paramIndex++;
        }
        if (keyword) {
            conditions.push(`(email ILIKE $${paramIndex} OR name ILIKE $${paramIndex} OR purpose ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
            params.push(`%${keyword}%`);
            paramIndex++;
        }
        let whereClause = '';
        if (conditions.length > 0) whereClause = ` WHERE ` + conditions.join(' AND ');
        const countQuery = `SELECT COUNT(*) FROM submission ${whereClause}`;
        const query = `
      SELECT * FROM submission 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        const countParams = [...params];
        const queryParams = [...params, limitInt, offset];
        const [dataRes, countRes] = await Promise.all([
            pool.query(query, queryParams),
            pool.query(countQuery, countParams)
        ]);
        const totalItems = parseInt(countRes.rows[0].count, 10);
        return { data: dataRes.rows, pagination: { page: pageInt, limit: limitInt, totalItems, totalPages: Math.ceil(totalItems / limitInt) } };
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

module.exports = SubmissionService;