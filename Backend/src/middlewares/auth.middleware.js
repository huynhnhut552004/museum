const jwt = require('jsonwebtoken');
const { HTTP_STATUS } = require('../constants/httpStatus');
const { AUTH_MESSAGES } = require('../constants/message');

const verifyTokenOption = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user=null;
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')){
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({message: AUTH_MESSAGES.UNAUTHORIZED});
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
};

const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: AUTH_MESSAGES.UNAUTHORIZED });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ message: AUTH_MESSAGES.FORBIDDEN });
    }

    next();
  };
};

module.exports = { verifyTokenOption, verifyToken, authorize };