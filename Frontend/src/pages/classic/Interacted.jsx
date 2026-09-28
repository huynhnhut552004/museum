import InteractedLayout from "../../components/Interacted";
import { useLanguage } from "../../routes/LanguageContext";

export default function Interacted() {
    const { lang } = useLanguage();

    const content = {
        heading: lang === 'vi' ? "Các sự kiện và tác phẩm bạn đã thích" : "Events and artworks you have liked",
        option1: lang === 'vi' ? "Tất cả" : "All",
        option2: lang === 'vi' ? "Tác phẩm" : "Artworks",
        option3: lang === 'vi' ? "Sự kiện" : "Events",
        null: lang === 'vi' ? "Bạn chưa thích tác phẩm hoặc sự kiện nào." : "You haven't liked any artworks or events yet.",
    };

    const style = {
        heading: "Style-Heading2",
        text: "Style-Text1",
        bg: "bg-[#E4E1D4]"
    };
    
    return (
        <InteractedLayout lang={lang} style={style} content={content} />
    )
}