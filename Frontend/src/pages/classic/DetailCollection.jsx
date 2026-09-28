import DetailCollectionLayout from "../../components/DetailCollection";
import { useLanguage } from "../../routes/LanguageContext";

export default function DetailCollection() {
    const { lang } = useLanguage();

    const style = {
        heading: "Style-Heading2",
        text: "Style-Text1"
    };

    const noti = {
        vi: {
            notfound: "Bộ sưu tập nãy rỗng.",
            private: "Bộ sưu tập này là riêng tư."
        },
        en: {
            notfound: "This collection is empty.",
            private: "This collection is private."
        }
    }

    return (
        <DetailCollectionLayout style={style} lang={lang} noti={noti[lang]} />
    )
}