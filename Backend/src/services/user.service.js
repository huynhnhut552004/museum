const { pool } = require('../config/postgres');
const redis = require('../config/redis');
const transporter = require('../config/email');
const bcrypt = require('bcryptjs');
const { generateUtils } = require('../utils/generate');
const createError = require ('../utils/createError');
const { AUTH_MESSAGES } = require('../constants/message');
const HTTP_STATUS = require('../constants/httpStatus');
const { CHANGE_EMAIL } = require('../constants/mail');

const UserService = {
    getProfile: async (userId) => {
        const res = await pool.query('SELECT id, email, full_name, role, is_banned FROM users WHERE id = $1', [userId]);
        return res.rows[0];
    },
    
    getUserByEmail: async (email) => {
        const query = `SELECT id, full_name, is_banned FROM users WHERE email= $1`;
        const res = await pool.query(query, [email]);
        return res.rows[0];
    },

    updateProfile: async (userId, data) => {
        const query = `
      UPDATE users 
      SET full_name = COALESCE($1, full_name), updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, full_name;
    `;
        const res = await pool.query(query, [data.full_name, userId]);
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
        await pool.query(
            'UPDATE users SET password_hash = $1, force_password_change = FALSE WHERE id = $2',
            [hashedNewPass, userId]
        );
        return true;
    },
    
    toggleBan: async (userId) => {
        const query = `
      UPDATE users 
      SET is_banned = NOT is_banned 
      WHERE id = $1 
      RETURNING id, is_banned
    `;
        const res = await pool.query(query, [userId]);
        return res.rows[0];
    }
};

module.exports = UserService;