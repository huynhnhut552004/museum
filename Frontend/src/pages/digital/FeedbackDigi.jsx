import FeedbackLayout from "../../components/FeedBack";
import PageTransition from "../../components/comon/Animation/AnimatedPage";
import { useLanguage } from "../../routes/LanguageContext";

export default function Feedback() {
    const { lang } = useLanguage();

    const style = {
        heading: "Digital-Heading",
        input: "Digital-Input",
        button: "text-[#F5F5F3]"
    };

    const contact = {
        title: lang === "vi" ? "Hãy cho chúng tôi biết suy nghĩ của bạn" : "Let us know what you think",
        name: lang === "vi" ? "Tên" : "Name",
        purpose: lang === "vi" ? "Mục đích liên hệ" : "Purpose of contact",
        content: lang === "vi" ? "Nội dung" : "Contact information",
        button: lang === "vi" ? "Gửi" : "Seen"
    };

    const noti = {
        wrongdata: lang === "vi" ? 'Vui lòng kiểm tra lại dữ liệu!' : 'Please check the data again!',
        server: lang === "vi" ? 'Không thể kết nối đến Server!' : 'Cannot connect to the Server!',
        undef: lang === "vi" ? 'Đã có lỗi xảy ra!' : 'An error has occurred!',
    };

    return (
        <PageTransition>
            <FeedbackLayout style={style} contact={contact} noti={noti} />
        </PageTransition>
    );
}