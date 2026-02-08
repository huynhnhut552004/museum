const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Ví dụ: mosaic.museum@gmail.com
    pass: process.env.EMAIL_PASS  // Mật khẩu ứng dụng (App Password)
  }
});

module.exports = transporter;