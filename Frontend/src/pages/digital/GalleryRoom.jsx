import GalleyScene from "../../components/digital/GalleryScene";

export default function GalleyRoom({ items, title, lang }) {
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
            detail: "Xem thêm chi tiết →"
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
            detail: "See more details →"
        };

    return (
        <GalleyScene items={items} title={title} lang={lang} content={content} />
    );
}