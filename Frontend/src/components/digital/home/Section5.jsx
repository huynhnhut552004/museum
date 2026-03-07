import Section5 from "../../componentLayout/homeDigi/Section5"

export default function Section5Digi() {
    const content = {
        title: "Tương lai ngay trước mắt.",
        desc: "Nghệ thuật số không thay thế nghệ thuật truyền thống, mà thay vào đó mà một sự mở rộng vô hạn trải nghiệm vẻ đẹp nghệ thuật và mọi thứ chỉ mới bắt đầu...",
        img: "/User/img/Home_center.png",
        bg: "/User/img/Home_bg7.png"
    }
    return (
        <Section5
            title={content.title}
            desc={content.desc}
            img={content.img}
            bg={content.bg}
        />
    )
}