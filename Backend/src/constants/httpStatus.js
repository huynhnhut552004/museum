const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400, // Lỗi do user gửi sai data
  UNAUTHORIZED: 401, // Chưa đăng nhập
  FORBIDDEN: 403, // Đã đăng nhập nhưng không có quyền (User đòi vào trang Admin)
  NOT_FOUND: 404,
  CONFLICT: 409, // Trùng email
  INTERNAL_SERVER: 500 // Lỗi code server
};

module.exports = HTTP_STATUS;