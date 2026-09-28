import PageTransition from "../../components/comon/Animation/AnimatedPage";
import ArtworkDetailDigitalLayout from "../../components/digital/ArtworkDetail";
import { useLanguage } from "../../routes/LanguageContext";

export default function ArtworkDetailDigital() {
    const { lang } = useLanguage();

    const noti =
        lang === "vi" ? {
            undef: "không xác định",
            errArt: "Lỗi thêm tác phẩm, vui lòng thử lại!",
            expire: "Đăng nhập hết hạn, vui lòng đăng nhập lại!",
            err: "Đã có lỗi xảy ra!",
            errServer: "Không thể kết nối đến Server!",
            errComment: "Lỗi khi xoá bình luận, vui lòng thử lại!",
        } : {
            undef: "undefined",
            errArt: "Error adding artwork, please try again!",
            expire: "Login session expired, please log in again!",
            err: "An error has occurred!",
            errServer: "Unable to connect to the server!",
            errComment: "Error deleting comment, please try again!",
        };

    const content =
        lang === "vi" ? {
            year: "Năm",
            collec: "Bộ sưu tập",
            location: "Cần Thơ, Việt Nam",
            about: "Về tác phẩm này",
            save: "Lưu vào bộ sưu tập",
            create: "Chưa có bộ sưu tập nào...Tạo ngay?",
            comment: "Bình luận",
            noComment: "Chưa có bình luận nào, hãy trở thành người bình luận đầu tiên.",
            load: "Đang tải...",
            same: "Các tác phẩm tương tự",
            createCate: "Tạo danh mục",
            private: "Riêng tư",
            privateExplane: "Chỉ có bạn mới thấy bộ sưu tập này.",
        } : {
            year: "Year",
            collec: "Collection",
            location: "Can Tho City, Vietnam",
            about: "About this artwork",
            save: "Save to collection",
            create: "No collections yet...Create now?",
            comment: "Comment",
            noComment: "No comments yet, be the first to comment.",
            load: "Loading...",
            same: "Similar artworks",
            createCate: "Create category",
            private: "Private",
            privateExplane: "Only you can see this collection.",
        };

    const input =
        lang === "vi" ? {
            search: "Tìm kiếm",
            comment: "Viết bình luận cho tác phẩm này...",
            collecName: "Đặt tên bộ sưu tập của bạn",
        } : {
            search: "Search",
            comment: "Write a comment for this artwork...",
            collecName: "Name your collection",
        };

    const button =
        lang === "vi" ? {
            save: "Lưu",
            cancel: "Huỷ",
            comment: "Bình luận",
            create: "Tạo",
            creating: "Đang tạo...",
        } : {
            save: "Save",
            cancel: "Cancel",
            comment: "Comment",
            create: "Create",
            creating: "Creating...",
        };

    const style = {
        heading: "Digital-Heading",
        text1: "Digital-Text1",
        text2: "Digital-Text2",
        like: "#000"
    };

    return (
        <PageTransition>
            <ArtworkDetailDigitalLayout
                content={content}
                noti={noti}
                input={input}
                button={button}
                lang={lang}
                style={style}
            />
        </PageTransition>
    )
}