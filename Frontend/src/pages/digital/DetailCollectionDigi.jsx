import DetailCollectionLayout from "../../components/DetailCollection";
import { useLanguage } from "../../routes/LanguageContext";

export default function DetailCollectionDigital() {
    const { lang } = useLanguage();

    const style = {
        heading: "Digital-Heading",
        text: "Digital-Text1"
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