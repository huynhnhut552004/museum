import PageTransition from "../../components/comon/Animation/AnimatedPage";
import LoginLayout from "../../components/login";
import { useLanguage } from "../../routes/LanguageContext";

export default function Login() {
    const { lang } = useLanguage();

    const content = {
        back: lang === "vi" ? "Trở về" : "Back",
        login: lang === 'vi' ? "Đăng nhập" : "Login",
        nameaccount: lang === 'vi' ? "Tên tài khoản" : "Username",
        pass: lang === 'vi' ? "Mật khẩu" : "Password",
        forget: lang === 'vi' ? "Bạn quên mật khẩu?" : "Forgot your password?",
        donthave: lang === 'vi' ? "Bạn chưa có tài khoản?" : "Don't have an account?",
        changepass: lang === 'vi' ? "Đặt lại mật khẩu" : "Reset password",
        email: lang === 'vi' ? "Nhập email" : "Enter email",
        confirm: lang === 'vi' ? "Xác nhận" : "Confirm",
        otp: lang === 'vi' ? "Mã OTP" : "OTP code",
        newpass: lang === 'vi' ? "Mật khẩu mới" : "New password",
        backlogin: lang === 'vi' ? "Quay lại đăng nhập." : "Back to login.",
        register: lang === 'vi' ? "Đăng ký" : "Register",
        name: lang === 'vi' ? "Tên" : "Name",
        warning: lang === 'vi' ? "Vui lòng sử dụng email đang hoạt động. Email này sẽ được dùng để khôi phục mật khẩu nếu bạn quên mật khẩu sau này." : "Please use an active email. This email will be used to recover your password if you forget it in the future.",
        enterpass: lang === 'vi' ? "Nhập mật khẩu" : "Enter password",
        confirmpass: lang === 'vi' ? "Xác nhận lại mật khẩu" : "Confirm password",
    };

    const noti = {
        wrongdata: lang === "vi" ? 'Vui lòng kiểm tra lại dữ liệu!' : 'Please check the data again!',
        server: lang === "vi" ? 'Không thể kết nối đến Server!' : 'Cannot connect to the Server!',
        undef: lang === "vi" ? 'Đã có lỗi xảy ra!' : 'An error has occurred!',
        lackdata: lang === 'vi' ? "Vui lòng nhập đủ thông tin!" : "Please fill in all required information!",
        successpass: lang === 'vi' ? "Đổi mật khẩu thành công." : "Password changed successfully.",
        weakpass: lang === 'vi' ? "Mật khẩu yếu!" : "Weak password!",
        invalidemail: lang === 'vi' ? "Email không đúng định dạng!" : "Invalid email format!",
        invalidotp: lang === 'vi' ? "Mã OTP không đúng hoặc đã hết hạn!" : "Invalid or expired OTP code!",
        notmatch: lang === 'vi' ? "Mật khẩu không khớp!" : "Passwords do not match!",
        successregister: lang === 'vi' ? "Đăng ký tài khoản thành công!" : "Account registered successfully!",
        duplicate: lang === 'vi' ? "Email này đã được sử dụng!" : "This email is already in use!",
        ban: lang == "vi" ? "Tài khoản của bạn đã bị khoá do vi phạm chính sách, vui lòng liên hệ người quản trị để biết thêm chi tiết!" : "Your account has been locked due to a policy violation, please contact the administrator for more details!",
        ban1: lang === 'vi' ? `Tài khoản tạm khóa do nhập sai quá nhiều lần. Thử lại sau {minute} phút.` : `Your account has been temporarily locked due to too many failed attempts. Try again after {minute} minutes.`,
        ban2: lang === 'vi' ? "Bạn đã nhập sai 10 lần. Tài khoản bị khóa 15 phút." : "You entered the wrong password 10 times. Your account has been locked for 15 minutes.",
        try: lang === 'vi' ? `Email hoặc mật khẩu không đúng. Bạn còn {count} lần thử.` : `Incorrect email or password. You have {count} attempts left.`,
        tolong: lang === 'vi' ? "Tên quá dài, tối đa 20 ký tự!" : "The name is too long, maximum 20 characters!",
    };

    const config = {
        bg: "bg-[#D8CBB0]",
        input: "Classic-Login-Input",
        back: "/",
        heading: "Style-Heading-Login",
        button: "Classic-Login-Button",
        label: "Style-Label-Login",
        icon: "invert",
        backcolor: "",
        text: "Style-Text1"
    };

    const animate = [
        { id: 1, class: 'absolute hidden md:block w-[700px] h-[700px] rounded-full border-[2px] border-dashed border-gray-900 animate-spin-slower' },
        { id: 2, class: 'absolute hidden md:block w-[670px] h-[670px] rounded-full border-[2px] border-dashed border-gray-700 animate-spin-reverse' },
        { id: 3, class: 'absolute hidden md:block w-[640px] h-[640px] rounded-full border-[2px] border-dashed border-gray-500 animate-spin-slow' }
    ];

    return (
        <PageTransition>
            <LoginLayout style={config} animate={animate} content={content} noti={noti} />
        </PageTransition>
    )
}