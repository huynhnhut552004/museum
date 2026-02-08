const FORGOT_PASS = (email, username, otp) =>({
    from: '"Mosaic Museum Support" <no-reply@mosaic.com>',
    to: `${email}`,
    subject: 'Khôi phục mật khẩu',
    html: `
        <h3>Yêu cầu cấp lại mật khẩu</h3>
        <p>Xin chào ${username},</p>
        <p>Mã OTP xác thực của bạn là: <b style="font-size: 24px; color: blue;">${otp}</b></p>
        <p>Mã có hiệu lực trong 5 phút.</p>
      `
});

const CHANGE_EMAIL = (newEmail, otp) => ({
    from: '"Mosaic Museum Security" <no-reply@mosaic.com>',
    to: `${newEmail}`,
    subject: 'Xác thực thay đổi Email',
    html: `
        <h3>Bạn đang yêu cầu thay đổi email đăng nhập</h3>
        <p>Mã xác thực của bạn là: <b style="font-size: 24px; color: red;">${otp}</b></p>
        <p>Nếu không phải bạn thực hiện, vui lòng bỏ qua email này.</p>
      `
});

module.exports={
    FORGOT_PASS,
    CHANGE_EMAIL
};