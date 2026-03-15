const AUTH_MESSAGES = {
  REGISTER_SUCCESS: 'Đăng ký tài khoản thành công!',
  LOGIN_SUCCESS: 'Đăng nhập thành công.',
  LOGIN_FAILED: 'Email hoặc mật khẩu không chính xác.',
  EMAIL_EXISTED: 'Email này đã được sử dụng.',
  UNAUTHORIZED: 'Bạn cần đăng nhập để thực hiện thao tác này.',
  FORBIDDEN: 'Bạn không có quyền truy cập tài nguyên này.',
  LOGOUT_SUCCESS: 'Đăng xuất thành công.',
  BAN: 'Tài khoản của bạn đã bị khóa vì vi phạm chính sách.',
  INVALID_SESSION: 'Phiên đăng nhập không hợp lệ',
  SESSION_EXPIRED: 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại',
  NOT_FOUND_BAN: 'Tài khoản đã bị khóa hoặc không tồn tại',
  NOT_FOUND_OTP: 'Mã OTP hết hạn hoặc không đúng',
  NOT_FOUND: "Không tìm thấy",
  INVALID_OTP: 'Mã OTP không chính xác',
  REFRESH_TOKEN: 'Làm mới token thành công',
  OTP_SEND: 'Gửi mã OTP thành công.',
  RESET_PASSWORD: 'Reset password thành công.',
  NOMATCH_PASSWORD: 'Mật khẩu cũ không đúng',
  UPDATED: 'Cập nhật thành công.',
  CHANGED_PASS: 'Đổi mật khẩu thành công.',
  WEAK_PASS: 'Mật khẩu yếu.'
};

const CATEROGY_MESSAGES = {
  CONFLICT: 'Danh mục đã tồn tại.',
  NOT_FOUND: 'Không tìm thấy danh mục.',
  INVALID_LAYOUT: 'Layout không hợp lệ.',
  CREATED: 'Tạo danh mục thành công.',
  UPDATED: 'Cập nhật danh mục thành công.',
  DELETEERR:'Lỗi khi xoá.',
  DELETED: 'Xoá danh mục thành công.'
};

const COLLECTION_MESSAGES = {
  NOT_FOUND: 'Bộ sưu tập không tồn tại.',
  FORBIDDEN: 'Bạn không có quyền xem bộ sưu tập này',
  ADDED: 'Thêm tác phẩm thành công.',
  DELETEART: 'Đã xóa khỏi bộ sưu tập',
  DELETED: 'Lỗi khi xoá.',
  UPDATED: 'Cập nhật bộ sưu tập thành công.',
  UPDATEERR: 'Lỗi cập nhật.',
  CREATED: 'Tạo thành công.'
};

const ARTWORK_MESSAGES = {
  CREATED: 'Tạo tác phẩm mới thành công.',
  NOT_FOUND: 'Không tìm thấy tác phẩm.',
  UPDATED: 'Cập nhật thông tin tác phẩm thành công.',
  DELETED: 'Đã xóa tác phẩm.',
  MISSING_FILE: 'Vui lòng chọn file ảnh hoặc video.'
};

const COMMENT_MESSAGES = {
  DELETE_ERR: 'Lỗi khi xoá comment.',
  CREATED: 'Tạo comment thành công.',
  DELETED: 'Xoá comment thành công.',
  PINED: 'Ghim comment thành công'
};

const EVENT_MESSAGES={
  MISSING_FILE: 'Vui lòng chọn file ảnh hoặc video.',
  CREATED: 'Tạo sự kiện thành công',
  DELETED: 'Xoá sự kiện thành công',
  UPDATED: 'Cập nhật sự kiện thành công'
};

const ERROR_MESSAGES={
  MISSING_ID: "Thiếu id.",
  MISSING_SLUG: "thiếu slug.",
  MISSING_DATA: "Vui lòng nhập đầy đủ thông tin.",
  WRONG_FORMAT: "Không đúng định dạng.",
  ERR_TIME: 'Thời gian kết thúc phải sau thời gian bắt đầu',
  NOT_FOUND: 'Không tìm thấy sự kiện.',
};

const SUCCESS_MESSAGES={
  REQUEST_OK: 'Gửi yêu cầu thành công.',
  POST_OK: 'Gửi thành công.',
  VERIFY_OK: 'Hợp lệ.',
  SUCCESS: 'Thành công.',
  DELETED: 'Xoá thành công.'
};

const CONTENT_MESSAGES={
  ORDER_UPDATED: 'Cập nhật thứ tự thành công.'
};

module.exports = {
  AUTH_MESSAGES,
  ARTWORK_MESSAGES,
  ERROR_MESSAGES,
  COMMENT_MESSAGES,
  CATEROGY_MESSAGES,
  COLLECTION_MESSAGES,
  SUCCESS_MESSAGES,
  EVENT_MESSAGES,
  CONTENT_MESSAGES
};