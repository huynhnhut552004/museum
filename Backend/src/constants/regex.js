const REGEX = {
  // Email chuẩn: user@domain.com
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Mật khẩu: Tối thiểu 8 ký tự, ít nhất 1 chữ cái và 1 số (để bảo mật tài khoản Admin/User)
  PASSWORD_STRONG: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  
  // Số điện thoại Việt Nam (10 số, bắt đầu bằng 0)
  PHONE_VN: /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
  
  // Slug: chi-chap-nhan-chu-thuong-va-dau-gach-ngang
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  
  // UUID (ID của Postgres): Kiểm tra xem ID gửi lên có đúng format UUID không
  UUID: /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
  
  // ObjectId (ID của Mongo): 24 ký tự hex
  MONGO_ID: /^[0-9a-fA-F]{24}$/
};

module.exports = REGEX;