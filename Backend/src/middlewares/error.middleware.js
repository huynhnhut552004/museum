const { HTTP_STATUS } = require('../constants/httpStatus');

const errorHandler = (err, req, res, next) => {
  console.error('Error Logic:', err);
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER;
  const message = err.message || 'Lỗi hệ thống, vui lòng thử lại sau.';
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;