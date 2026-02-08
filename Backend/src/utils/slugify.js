const slugify = (text) => {
  if (!text) return '';

  return text
    .toString() // Chuyển về chuỗi
    .toLowerCase() // Chữ thường
    .normalize('NFD') // Tách dấu ra khỏi chữ (Ví dụ: ê -> e + ^)
    .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu vừa tách
    .replace(/[đĐ]/g, 'd') // Chuyển đ -> d
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu -
    .replace(/[^\w\-]+/g, '') // Xóa hết các ký tự đặc biệt còn sót lại
    .replace(/\-\-+/g, '-') // Xóa các dấu - trùng nhau
    .replace(/^-+/, '') // Xóa dấu - ở đầu
    .replace(/-+$/, ''); // Xóa dấu - ở cuối
};

module.exports = slugify;