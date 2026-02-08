import Section1 from "./Section1";

export default function Section1Content() {
    const content = {
        title: "Nghệ thuật kỹ thuật số là ngôn ngữ.",
        desc: "Không chỉ là một công cụ, nghệ thuật số là một ngôn ngữ của cảm xúc, nó diễn đạt ý tưởng bằng thuật toán, chuyển động, ánh sáng, tương tác từ đó giúp công nghệ trở thành chất liệu hàng đầu trong thời đại kỹ thuật số.",
        img: "/User/img/Home_Right2.png",
        bg: "/User/img/Home_bg1.png"
    }
    return (
        <Section1
            title={content.title}
            desc={content.desc}
            img={content.img}
            bg={content.bg}
        />
    )
}