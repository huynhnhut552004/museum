import UserProfileLayout from "../../components/UserProfile";
import PageTransition from "../../components/comon/Animation/AnimatedPage";
import { useLanguage } from "../../routes/LanguageContext";

export default function UserProfileDigital() {
    const { lang } = useLanguage();

    const style = {
        heading: "Digital-Heading",
        text: "Digital-Text1",
        button_bg_color: "bg-[#f5f5f3]",
        button_bg_popup_color: "bg-[#191B1D]",
        text_color: "text-black",
        button_color: "white",
        bg1: "bg-[#f5f5f3]",
        bg2: "bg-[#f5f5f3]",
        text_color_popup: "text-black",
        input: "Digital-Login-Input",
        text_null_color: "text-white",
        textColor: "text-gray-200",
        border: "border-gray-400"
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
