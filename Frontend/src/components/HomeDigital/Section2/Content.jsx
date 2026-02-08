import Section2 from "./Section2";

export default function Section2Content() {
    const content = {
        title: "Khi công nghệ trở thành công cụ sáng tạo.",
        desc: "Khi máy tính không chỉ tính toán mà còn sáng tạo. AI, 3D, dữ liệu mở ra những hình thức nghệ thuật chưa từng tồn tại, không tưởng. Tác phẩm không còn tĩnh mà mang tính thị giác, tương tác cao.",
        img: "/User/img/Home_Left1.png",
        bg: "/User/img/Home_bg8.png"
    }
    return (
        <Section2
            title={content.title}
            desc={content.desc}
            img={content.img}
            bg={content.bg}
        />
    )
}