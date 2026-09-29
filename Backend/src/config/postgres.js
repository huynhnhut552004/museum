const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URI,
    ssl: {
        rejectUnauthorized: false
    }
});

const connectPostgres = async () => {
    try {
        const client = await pool.connect();
        const res = await client.query('SELECT version()');
        console.log(`✅ Đã kết nối PostgreSQL phiên bản: ${res.rows[0].version.split(' ')[0]}`);
        client.release();
    } catch (error) {
        console.error(`❌ Lỗi kết nối PostgreSQL:`, error.message);
        throw error;
    }
};

module.exports = {
    pool,
    connectPostgres
};