const Redis = require('ioredis');
const redisURI = process.env.REDIS_URI;

const redis = new Redis(redisURI);
redis.on('connect', () => {
  console.log('✅ Đã kết nối Redis');
});
redis.on('error', (err) => {
  console.error('❌ Lỗi kết nối Redis:', err);
});

module.exports = redis;