import PageTransition from "../../components/comon/Animation/AnimatedPage";
import EditAccountLayout from "../../components/EditAccount";
import { useLanguage } from "../../routes/LanguageContext";

export default function EditAccount() {
    const { lang } = useLanguage();

    const content = {
        heading: lang === 'vi' ? "Thông tin cá nhân" : "Personal Information",
        expired: lang === 'vi' ? "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!" : "Your session has expired, please log in again!",
        yourname1: lang === 'vi' ? "Tên của bạn:" : "Your name:",
        changepass1: lang === 'vi' ? "Thay đổi mật khẩu" : "Change password",
        ban: lang === 'vi' ? "Tài khoản bị vô hiệu hoá, vui lòng liên hệ quản trị." : "Your account has been disabled, please contact the administrator.",
        unban: lang === 'vi' ? "Tài khoản còn hoạt động." : "Your account is active.",
        changename: lang === 'vi' ? "Đổi tên" : "Change name",
        newname: lang === 'vi' ? "Tên mới" : "New name",
        yourname2: lang === 'vi' ? "Tên của bạn" : "Your name",
        confirm: lang === 'vi' ? "Xác nhận" : "Confirm",
        changeemail: lang === 'vi' ? "Đổi Email" : "Change Email",
        newemail: lang === 'vi' ? "Email mới" : "New email",
        youremail: lang === 'vi' ? "Email của bạn" : "Your email",
        seen: lang === 'vi' ? "Gửi" : "Send",
        otp: lang === 'vi' ? "Mã OTP" : "OTP code",
        Changepass2: lang === 'vi' ? "Đổi mật khẩu" : "Change password",
        oldpass1: lang === 'vi' ? "Mật khẩu cũ" : "Old password",
        oldpass2: lang === 'vi' ? "Mật khẩu hiện tại" : "Current password",
        newpass: lang === 'vi' ? "Mật khẩu mới" : "New password",
        confirmpass1: lang === 'vi' ? "Xác nhận mật khẩu" : "Confirm password",
        confirmpass2: lang === 'vi' ? "Xác nhận lại mật khẩu" : "Confirm password again",
    };

    const noti = {
        wrongdata: lang === "vi" ? 'Vui lòng kiểm tra lại dữ liệu!' : 'Please check the data again!',
        server: lang === "vi" ? 'Không thể kết nối đến Server!' : 'Cannot connect to the Server!',
        undef: lang === "vi" ? 'Đã có lỗi xảy ra!' : 'An error has occurred!',
        expired: lang === 'vi' ? "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!" : "Your session has expired, please log in again!",
        successname: lang === 'vi' ? "Đổi tên thành công." : "Name changed successfully.",
        successemail: lang === 'vi' ? "Đổi Email thành công." : "Email changed successfully.",
        unchangeemail: lang === 'vi' ? "Đổi email thất bại, vui lòng kiểm tra lại otp!" : "Failed to change email, please check your OTP again!",
        notmatch: lang === 'vi' ? "Mật khẩu không khớp!" : "Passwords do not match!",
        successpass: lang === 'vi' ? "Đổi mật khẩu thành công." : "Password changed successfully.",
        weakpass: lang === 'vi' ? "Mật khẩu yếu!" : "Weak password!",
        wrongpass: lang === 'vi' ? "Mật khẩu không đúng!" : "Incorrect password!",
        tolong: lang === 'vi' ? "Tên quá dài, tối đa 20 ký tự!" : "The name is too long, maximum 20 characters!",
    };

    const style = {
        heading: "Digital-Heading",
        text: "Digital-Text1",
        border: "border-white",
        hover_div: "lg:hover:bg-gray-600",
        input: "Digital-Login-Input",
        bg_button: "bg-[#f5f5f3]",
        text_color: "text-black"
    }

    return (
        <PageTransition>
            <EditAccountLayout lang={lang} style={style} content={content} noti={noti} />
        </PageTransition>
    )
}