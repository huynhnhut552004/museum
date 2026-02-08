require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../../config/postgres'); 
const runMigration = async () => {
  try {
    const sqlPath = path.join(__dirname, 'init_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('🔄 Đang kết nối tới Neon PostgreSQL...');
    const client = await pool.connect();
    console.log('⚡ Đang khởi tạo bảng...');
    await client.query(sql);
    client.release();
    console.log('✅ KHỞI TẠO DATABASE THÀNH CÔNG! (Đã tạo đủ 10 bảng)');
    process.exit(0);
  } catch (error) {
    console.error('❌ LỖI KHI TẠO BẢNG:', error);
    process.exit(1);
  }
};

runMigration();