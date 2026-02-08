const Redis = require('ioredis');
const redisURI = process.env.REDIS_URI;

if (!redisURI) {
  console.error('❌ REDIS_URI chưa được khai báo trong .env');
  process.exit(1);
}
const redis = new Redis(redisURI);
redis.on('connect', () => {
  console.log('🔌 Redis đã kết nối thành công!');
});
redis.on('error', (err) => {
  console.error('❌ Lỗi kết nối Redis:', err);
});

module.exports = redis;