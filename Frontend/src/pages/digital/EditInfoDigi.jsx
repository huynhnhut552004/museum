import EditInfoLayout from "../../components/EditInfo";
import { useLanguage } from "../../routes/LanguageContext";
import PageTransition from "../../components/comon/Animation/AnimatedPage";

export default function EditInfoDigital() {
    const { lang } = useLanguage();
    const content = {
        vi: {
            title: "Chỉnh sửa thông tin cá nhân",
            button: "Cập nhật",
            nickName: "Biệt danh",
            birthday: "Sinh nhật",
            inputNickName: "Đặt biệt danh cho bạn",
            inputBirthday: "Sinh nhật của bạn",
            hobby: "Sở thích",
            inputEmail: "Email của bạn",
            inputHobby: "Sở thích của bạn",
            desc: "Mô tả",
            inputDesc: "Mô tả về bạn"
        },
        en: {
            title: "Edit Personal Information",
            button: "Update",
            nickName: "Nickname",
            birthday: "Birthday",
            inputNickName: "Set your nickname",
            inputBirthday: "Your birthday",
            hobby: "Hobbies",
            inputEmail: "Your email",
            inputHobby: "Your hobbies",
            desc: "Description",
            inputDesc: "Describe yourself"
        }
    };

    const noti = {
        vi: {
            err: 'Cập nhật thông tin cá nhân thành công.',
            succes: "Lỗi cập nhật thông tin!"
        },
        en: {
            err: 'Personal information updated successfully.',
            succes: "Error updating information!"
        }
    };

    const style = {
        heading: "Digital-Heading",
        text: "Digital-Text1",
        border: "border-white",
        borderSection: "border-gray-400",
        hover_div: "lg:hover:bg-gray-600",
        input: "Digital-Login-Input",
        bg_button: "bg-[#f5f5f3]",
        text_color: "text-black"
    }

    return (
        <PageTransition>
            <EditInfoLayout noti={lang === "vi" ? noti.vi : noti.en} style={style} lang={lang} content={lang === "vi" ? content.vi : content.en} />
        </PageTransition>
    )
}