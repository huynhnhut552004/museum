import EditInfoLayout from "../../components/EditInfo";
import { useLanguage } from "../../routes/LanguageContext";
import PageTransition from "../../components/comon/Animation/AnimatedPage";

export default function EditInfo() {
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
        heading: "Style-Heading2",
        text: "Style-Text1",
        border: "border-gray-800",
        hover_div: "lg:hover:bg-black/20",
        input: "Classic-Login-Input",
        bg_button: "bg-[#0F3A32]",
        text_color: "text-white",
        border: "border-gray-600"
    }
    return (
        <PageTransition>
            <EditInfoLayout noti={lang === "vi" ? noti.vi : noti.en} style={style} lang={lang} content={lang === "vi" ? content.vi : content.en} />
        </PageTransition>
    )
}