const { HTTP_STATUS } = require('../constants/httpStatus');

const errorHandler = (err, req, res, _next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error Logic:', err);
  }
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER;
  const message = err.message || 'Lỗi hệ thống, vui lòng thử lại sau.';
  if (err?.status === 503) return res.status(503).json({ errorCode: "AI_OVERLOADED", message: "AI đang quá tải, vui lòng thử lại sau.", });
  if (err?.http_code) return res.status(err.http_code).json({ message: err.message, errorCode: "CLOUDINARY_ERROR", });
  res.status(statusCode).json({ success: false, status: statusCode, message: message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined });
};

module.exports = errorHandler;