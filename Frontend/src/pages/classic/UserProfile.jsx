import UserProfileLayout from "../../components/UserProfile";
import PageTransition from "../../components/comon/Animation/AnimatedPage";
import { useLanguage } from "../../routes/LanguageContext";

export default function UserProfile() {
    const { lang } = useLanguage();

    const style = {
        heading: "Style-Heading2",
        text: "Style-Text1",
        button_bg_color: "bg-[#0F3A32]",
        button_bg_popup_color: "bg-[#0F3A32]",
        text_color: "text-white",
        button_color: "black",
        bg1: "bg-[#f9f6ec]",
        bg2: "bg-[#E4E1D4]",
        text_color_popup: "",
        input: "Classic-Login-Input",
        text_null_color: "",
        textColor: "text-gray-800",
        border: "border-gray-600"
    };

    const content = {
        vi: {
            title: "Bộ sưu tập",
            null: "Hiện tại chưa có bộ sưu tập nào...",
            private1: "Bộ sưu tập này là riêng tư.",
            item: "ghim",
            nickname: "Biệt danh",
            birthday: "Ngày sinh",
            hobby: "Sở thích",
            description: "Mô tả",
            profile: "Hồ sơ của"
        },
        en: {
            title: "Collection",
            null: "There aren't any collections at the moment...",
            private1: "This collection is private.",
            item: "item",
            create: "Create a collection",
            nickname: "Nickname",
            birthday: "Birthday",
            hobby: "Hobby",
            description: "Description",
            profile: "'s Profile"
        },
    };

    return (
        <PageTransition>
            <UserProfileLayout lang={lang} content={content[lang]} style={style} />
        </PageTransition>
    )
}
