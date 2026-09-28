const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { pool } = require('../config/postgres');
const bcrypt = require('bcryptjs');
const generateUtils = require('./generate');

async function createAccunt() {
    try {
        const query = `INSERT INTO users (email, password_hash, full_name, user_tag, role)
        VALUES ($1, $2, $3, $4, 'viewer')
        RETURNING id, email, full_name, role, created_at`;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("Museum@Demo2026", salt);
        const userTag = generateUtils.randomUserTag(5);
        const email = "museumdemo2026@gmail.com";
        const name = "viewer";
        const res = await pool.query(query, [email, hashedPassword, name, userTag]);
        console.log("tạo tài khoản thành công");
        console.log(res.rows[0]);
    } catch (error) {
        console.log("tạo tài khoản thất bại:", error);
    }
};

createAccunt();