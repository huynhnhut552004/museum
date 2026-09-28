const { Worker } = require('bullmq');
const { processArtworkAI } = require('./artwork.job');
const Redis = require('ioredis');
const REDIS_URL = process.env.REDIS_URI;

function getAdminErrorMessage(code) {
  const messages = {
    INVALID_LAYOUT: 'Loại bố cục của tác phẩm không hợp lệ.',
    IMAGE_ERROR: 'Không thể tải hoặc đọc hình ảnh của tác phẩm.',
    IMAGE_TOO_LARGE: 'Hình ảnh quá lớn, AI không thể xử lý an toàn.',
    IMAGE_PROCESSING_ERROR: 'Không thể xử lý hình ảnh trước khi gửi cho AI.',
    AI_GENERATION_ERROR: 'AI không thể tạo kết quả cho tác phẩm này.',
    AI_RESPONSE_ERROR: 'AI trả về dữ liệu không hợp lệ hoặc thiếu thông tin.',
    POSTGRES_SYNC_ERROR: 'Không thể lưu dữ liệu vào PostgreSQL.',
    MONGODB_SYNC_ERROR: 'Không thể lưu dữ liệu vào MongoDB.',
    ALGOLIA_SYNC_ERROR: 'Không thể đồng bộ dữ liệu với Algolia.',
    ROLLBACK_ERROR: 'Khôi phục dữ liệu thất bại. Tác phẩm cần được kiểm tra thủ công.',
    AI_PROCESSING_ERROR: 'Có lỗi xảy ra trong quá trình xử lý AI.'
  };
  return messages[code] || messages.AI_PROCESSING_ERROR;
}

const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: { rejectUnauthorized: false }
});

const aiWorker = new Worker('artwork-ai-processing', async (job) => {
  const maxAttempts = job.opts.attempts || 1;
  const currentAttempt = job.attemptsMade + 1;
  console.log(`[AI Worker] Bắt đầu xử lý Job: ${job.name} (Lần thử: ${currentAttempt}/${maxAttempts})`);
  try {
    switch (job.name) {
      case 'process-artwork':
        await processArtworkAI(job.data);
        break;
      default:
        console.warn(`[AI Worker] Không nhận diện được loại Job: ${job.name}`);
        return;
    }
    if (global.io) {
      global.io.emit('ai-alert', {
        status: 'success',
        title: job.data.title,
        message: `Tác phẩm "${job.data.title}" đã được AI phân tích và lưu thành công!`
      });
    }
  } catch (error) {
    console.error(`[AI Worker] Lỗi Job ${job.name} (Lần ${currentAttempt}):`, error.message);
    if (currentAttempt >= maxAttempts) {
      const { pool } = require('../config/postgres');
      try {
        await pool.query("UPDATE artworks SET status = 'draft' WHERE id = $1", [job.data.artworkId]);
        console.log(`[AI Worker] Tác phẩm ID ${job.data.artworkId} đã được chuyển về 'draft'.`);
      } catch (dbErr) {
        console.error("[AI Worker] Lỗi khi cập nhật status DB:", dbErr);
      }
      if (global.io) {
        global.io.emit('ai-alert', {
          status: 'error',
          code: error.code || 'AI_PROCESSING_ERROR',
          message: getAdminErrorMessage(error.code),
          artworkId: job.data.artworkId,
          title: job.data.title,
          retryable: currentAttempt < maxAttempts,
          attempts: currentAttempt,
          maxAttempts
        });
      }
    } else {
      console.log(`[AI Worker] Tạm ẩn thông báo lỗi. Đang đợi BullMQ tự động Retry...`);
    }
    throw error;
  }
}, {
  connection: redisConnection,
  concurrency: 1,
  limiter: { max: 4, duration: 60000 }
});

module.exports = aiWorker;