const redis = require('../config/redis');

const clearCachePattern = (pattern) => {
  return new Promise((resolve, reject) => {
    const stream = redis.scanStream({ match: pattern, count: 100 });
    let totalDeleted = 0;
    stream.on('data', async (keys) => {
      if (keys.length > 0) {
        stream.pause();
        try {
          await redis.unlink(keys);
          totalDeleted += keys.length;
        } catch (err) {
          console.error(`❌ Lỗi xóa cache chunk:`, err);
        } finally {
          stream.resume();
        }
      }
    });
    stream.on('end', () => {
      console.log(`🧹 Đã dọn dẹp cache: ${pattern} (Tổng: ${totalDeleted} keys)`);
      resolve();
    });
    stream.on('error', (err) => {
      console.error('❌ Redis Scan Error:', err);
      reject(err);
    });
  });
};

module.exports = { clearCachePattern };