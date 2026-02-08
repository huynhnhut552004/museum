const { pool } = require('../config/postgres');
const redis = require('../config/redis');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../config/email');
const {generateUtils} = require('../utils/generate');
const createError = require ('../utils/createError');
const HTTP_STATUS = require('../constants/httpStatus');
const { AUTH_MESSAGES } = require('../constants/message');
const FORGOT_PASS = require('../constants/mail');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const MAX_ATTEMPTS = 10;
const LOCK_TIME = 15 * 60;

const AuthService = {
  register: async ({ email, password, full_name }) => {
    const check = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (check.rows.length > 0) throw createError(AUTH_MESSAGES.EMAIL_EXISTED, HTTP_STATUS.CONFLICT);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const query = `
      INSERT INTO users (email, password_hash, full_name, role)
      VALUES ($1, $2, $3, 'user')
      RETURNING id, email, full_name, role, created_at
    `;
    const res = await pool.query(query, [email, hashedPassword, full_name]);
    return res.rows[0];
  },

  login: async ({ email, password }) => {
    const attempts = await redis.get(`login_attempts:${email}`);
    if (attempts && parseInt(attempts) >= MAX_ATTEMPTS) {
       const ttl = await redis.ttl(`login_attempts:${email}`);
       const minutes = Math.ceil(ttl / 60);
       throw new Error(`Tài khoản tạm khóa do nhập sai quá nhiều lần. Thử lại sau ${minutes} phút.`);
    }
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = res.rows[0];
    const handleLoginFail = async () => {
       const newAttempts = await redis.incr(`login_attempts:${email}`);
       if (newAttempts === 1) {
         await redis.expire(`login_attempts:${email}`, LOCK_TIME);
       }
       const left = MAX_ATTEMPTS - newAttempts;
       if (left <= 0) {
          throw new Error(`Bạn đã nhập sai 10 lần. Tài khoản bị khóa 15 phút.`);
       } else {
          throw new Error(`Email hoặc mật khẩu không đúng. Bạn còn ${left} lần thử.`);
       }
    };
    if (!user) {
       await handleLoginFail();
    }
    if (user.role=="user" && user.is_banned) {
      throw createError(AUTH_MESSAGES.BAN, HTTP_STATUS.UNAUTHORIZED);
    }
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
       await handleLoginFail();
    }
    await redis.del(`login_attempts:${email}`);
    const payload = { id: user.id, role: user.role };
    const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
    await redis.set(`auth:refresh:${user.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);
    delete user.password_hash;
    return { user, accessToken, refreshToken };
  },

  logout: async (userId) => {
    await redis.del(`auth:refresh:${userId}`);
    return true;
  },

  refreshToken: async (userId, tokenFromClient) => {
    const storedToken = await redis.get(`auth:refresh:${userId}`);
    if (!storedToken || storedToken !== tokenFromClient) {
      throw createError (AUTH_MESSAGES.INVALID_SESSION, HTTP_STATUS.UNAUTHORIZED);
    }
    try {
      jwt.verify(storedToken, REFRESH_SECRET);
    } catch (err) {
      throw createError (AUTH_MESSAGES.SESSION_EXPIRED, HTTP_STATUS.UNAUTHORIZED);
    }
    const userRes = await pool.query('SELECT role, is_banned FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];
    if (!user || user.is_banned) {
      await redis.del(`auth:refresh:${userId}`);
      throw createError (AUTH_MESSAGES.NOT_FOUND_BAN, HTTP_STATUS.UNAUTHORIZED);
    }
    const newAccessToken = jwt.sign({ id: userId, role: user.role }, ACCESS_SECRET, { expiresIn: '1h' });
    return { accessToken: newAccessToken };
  },

  forgotPassword: async (email) => {
    const res = await pool.query('SELECT id, full_name FROM users WHERE email = $1', [email]);
    const user = res.rows[0];
    if (!user) return true;
    const otp = generateUtils.randomOTP();
    await redis.set(`reset_pass:${email}`, otp, 'EX', 300);
    const mailOptions = FORGOT_PASS(email, user.full_name, otp);
    await transporter.sendMail(mailOptions);
    return true;
  },

  resetPassword: async ({ email, otp, newPassword }) => {
    const storedOtp = await redis.get(`reset_pass:${email}`);
    if (!storedOtp) {
      throw createError (AUTH_MESSAGES.NOT_FOUND_OTP, HTTP_STATUS.UNAUTHORIZED);
    }
    if (storedOtp !== otp) {
      throw createError (AUTH_MESSAGES.INVALID_OTP, HTTP_STATUS.UNAUTHORIZED);
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await pool.query(
      'UPDATE users SET password_hash = $1, force_password_change = FALSE, updated_at = NOW() WHERE email = $2',
      [hashedPassword, email]
    );
    await redis.del(`reset_pass:${email}`); 
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rows.length > 0) {
      await redis.del(`auth:refresh:${userRes.rows[0].id}`);
    }
    return true;
  }
};

module.exports = AuthService;