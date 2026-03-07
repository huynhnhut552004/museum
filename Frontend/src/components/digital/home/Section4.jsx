import Section4 from "../../componentLayout/homeDigi/Section4"

export default function Section4Digi() {
    const content = {
        title: "Trải nghiệm thay vì quan sát.",
        desc: "Khác với nghệ thuật truyền thống, người xem chỉ đứng bên ngoài quan sát. Đối với nghệ thuật số, người xem tham gia trải nghiệm câu chuyện của từng tác phẩm, mỗi một âm thanh, hình ảnh, tương tác đều mang lại trải nghiệm cá nhân hoá và mỗi lần tiếp cận đều mang đến một cảm nhận khác nhau.",
        img: "/User/img/Home_Left2.png",
        bg: "/User/img/Home_bg3.png"
    }
    return (
        <Section4
            title={content.title}
            desc={content.desc}
            img={content.img}
            bg={content.bg}
        />
    )
}