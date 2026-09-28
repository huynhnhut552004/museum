import SearchLayout from "../../components/Search";
import PageTransition from "../../components/comon/Animation/AnimatedPage";
import { useLanguage } from "../../routes/LanguageContext";

export default function Search() {
    const { lang } = useLanguage();

    const content = {
        input: lang === "vi" ? "Bạn đang tìm..." : "You are looking...",
        button: lang === "vi" ? "Tìm kiếm" : "Search",
        title1: lang === "vi" ? "Có thể bạn đang tìm" : "You might be looking",
        title2: lang === "vi" ? "Kết quả tìm kiếm" : "Search results",
        error: lang === "vi" ? "Không tìm thấy kết quả phù hợp" : "No matching results found",
        noTrend: lang === "vi" ? "Hiện chưa có xu hướng tìm kiếm." : "There is currently no search trend."
    };

    return (
        <PageTransition>
            <SearchLayout content={content} lang={lang} />
        </PageTransition>
    );
}