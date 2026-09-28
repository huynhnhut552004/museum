const { pool } = require('../config/postgres');
const redis = require('../config/redis');
const transporter = require('../config/email');
const bcrypt = require('bcryptjs');
const generateUtils = require('../utils/generate');
const createError = require('../utils/createError');
const { AUTH_MESSAGES } = require('../constants/message');
const { HTTP_STATUS } = require('../constants/httpStatus');
const { CHANGE_EMAIL } = require('../constants/mail');

const UserService = {
    getProfile: async (userId) => {
        const res = await pool.query('SELECT id, email, full_name, user_tag, info, role, is_banned FROM users WHERE id = $1', [userId]);
        return res.rows[0];
    },

    getUserByEmail: async (email) => {
        const query = `SELECT id, full_name, user_tag, is_banned FROM users WHERE email= $1`;
        const res = await pool.query(query, [email]);
        if (res.rows.length === 0) throw createError(AUTH_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        return res.rows[0];
    },

    getUserByTag: async (name, tag) => {
        const query = `SELECT id, full_name, user_tag, info FROM users WHERE full_name = $1 AND user_tag = $2`;
        const res = await pool.query(query, [name, tag]);
        if (res.rows.length === 0) throw createError(AUTH_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        return res.rows[0];
    },

    updateProfile: async (userId, data) => {
        const query =
            `UPDATE users 
            SET full_name = COALESCE($1, full_name), updated_at = NOW()
            WHERE id = $2
            RETURNING id, email, full_name;`;
        const res = await pool.query(query, [data.full_name, userId]);
        return res.rows[0];
    },

    updateInfo: async (data, userId) => {
        const query =
            `UPDATE users
                SET info = $1::jsonb, updated_at = NOW()
                WHERE id = $2
                RETURNING id, info;`;
        const res = await pool.query(query, [data, userId]);
        return res.rows[0];
    },

    requestEmailChange: async (userId, newEmail) => {
        const check = await pool.query('SELECT id FROM users WHERE email = $1', [newEmail]);
        if (check.rows.length > 0) throw createError(AUTH_MESSAGES.EMAIL_EXISTED, HTTP_STATUS.CONFLICT);
        const otp = generateUtils.randomOTP();
        const tempPayload = JSON.stringify({ newEmail, otp });
        await redis.set(`email_change:${userId}`, tempPayload, 'EX', 300);
        const mailOptions = CHANGE_EMAIL(newEmail, otp);
        await transporter.sendMail(mailOptions);
        return true;
    },

    verifyEmailChange: async (userId, inputOtp) => {
        const rawData = await redis.get(`email_change:${userId}`);
        if (!rawData) throw createError(AUTH_MESSAGES.NOT_FOUND_OTP, HTTP_STATUS.NOT_FOUND);
        const { newEmail, otp } = JSON.parse(rawData);
        if (inputOtp !== otp) throw createError(AUTH_MESSAGES.INVALID_OTP, HTTP_STATUS.BAD_REQUEST);
        const client = await pool.connect();
        try {
            await client.query('UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2', [newEmail, userId]);
            await redis.del(`email_change:${userId}`);
            await redis.del(`auth:refresh:${userId}`);
            return { message: 'Đổi email thành công. Vui lòng đăng nhập lại.' };
        } finally {
            client.release();
        }
    },

    changePassword: async (userId, oldPass, newPass) => {
        const res = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
        const user = res.rows[0];
        const isValid = await bcrypt.compare(oldPass, user.password_hash);
        if (!isValid) throw createError(AUTH_MESSAGES.NOMATCH_PASSWORD, HTTP_STATUS.BAD_REQUEST);
        const salt = await bcrypt.genSalt(10);
        const hashedNewPass = await bcrypt.hash(newPass, salt);
        await pool.query('UPDATE users SET password_hash = $1, force_password_change = FALSE WHERE id = $2', [hashedNewPass, userId]);
        return true;
    },

    getUser: async ({ page = 1, limit = 20 }) => {
        const offset = (page - 1) * limit;
        const [dataRes, countRes] = await Promise.all([
            pool.query(
                `SELECT id, email, full_name, user_tag, role, is_banned, created_at, updated_at
             FROM users
             ORDER BY created_at DESC
             LIMIT $1 OFFSET $2`,
                [limit, offset]
            ),
            pool.query(`SELECT COUNT(id) FROM users`)
        ]);
        const totalItems = parseInt(countRes.rows[0].count, 10);
        return {
            data: dataRes.rows,
            pagination: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                totalItems,
                totalPages: Math.ceil(totalItems / limit)
            }
        };
    },

    searchUsersForAdmin: async ({ page = 1, limit = 20, keyword = '' }) => {
        const offset = (page - 1) * limit;
        const params = [];
        let paramIndex = 1;
        let query = `SELECT id, email, full_name, user_tag, role, is_banned, created_at, updated_at FROM users`;
        let countQuery = `SELECT COUNT(id) FROM users`;
        let conditions = [];
        if (keyword) {
            conditions.push(`(email ILIKE $${paramIndex} OR full_name ILIKE $${paramIndex} OR user_tag ILIKE $${paramIndex} OR role ILIKE $${paramIndex})`);
            params.push(`%${keyword}%`);
            paramIndex++;
        }
        if (conditions.length > 0) {
            const whereClause = ` WHERE ` + conditions.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }
        query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1} `;
        const countParams = [...params];
        params.push(limit, offset);
        const [dataRes, countRes] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, countParams)
        ]);
        const totalItems = parseInt(countRes.rows[0].count, 10);
        return {
            data: dataRes.rows,
            pagination: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                totalItems,
                totalPages: Math.ceil(totalItems / limit)
            }
        };
    },

    createUser: async (email, password, full_name, role, ban) => {
        const check = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) throw createError(AUTH_MESSAGES.EMAIL_EXISTED, HTTP_STATUS.CONFLICT);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const MAX_RETRIES = 5;
        for (let i = 0; i < MAX_RETRIES; i++) {
            const userTag = generateUtils.randomUserTag(5);
            const query =
                `INSERT INTO users (email, password_hash, full_name, user_tag, role, is_banned)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, full_name, role, created_at`;
            try {
                const res = await pool.query(query, [email, hashedPassword, full_name, userTag, role, ban]);
                return res.rows[0];
            } catch (error) {
                if (error.code === '23505' && error.constraint === 'users_user_tag_key') continue;
                throw error;
            }
        }
        throw createError('Không thể tạo tài khoản lúc này, vui lòng thử lại', HTTP_STATUS.INTERNAL_SERVER);
    },

    toggleBan: async (userId) => {
        const query =
            `UPDATE users 
      SET is_banned = NOT is_banned 
      WHERE id = $1 
      RETURNING id, is_banned`;
        const res = await pool.query(query, [userId]);
        return res.rows[0];
    }
};

module.exports = UserService;