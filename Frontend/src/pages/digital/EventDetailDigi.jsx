import EventDetailLayout from "../../components/EventDetail";
import PageTransition from "../../components/comon/Animation/AnimatedPage";
import { useLanguage } from "../../routes/LanguageContext";

export default function EventDetailDigiatal() {
    const { lang } = useLanguage();

    const content =
        lang === "vi" ? {
            comment: "Bình luận",
            noComment: "Chưa có bình luận nào, hãy trở thành người bình luận đầu tiên.",
            load: "Đang tải...",
        } : {
            comment: "Comment",
            noComment: "No comments yet, be the first to comment.",
            load: "Loading...",
        };

    const input =
        lang === "vi" ? {
            comment: "Viết bình luận cho tác phẩm này...",
        } : {
            comment: "Write a comment for this artwork...",
        };

    const button =
        lang === "vi" ? {
            cancel: "Huỷ",
            comment: "Bình luận",
        } : {
            cancel: "Cancel",
            comment: "Comment",
        };

    const style = {
        heading: "Digital-Heading",
        text1: "Digital-Text1",
        text2: "Digital-Text2",
        like: "#fff"
    }

    return (
        <PageTransition>
            <EventDetailLayout lang={lang} content={content} input={input} button={button} style={style} type={'digital'} />
        </PageTransition>
    )
}