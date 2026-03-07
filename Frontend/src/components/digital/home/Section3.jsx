import Section3 from "../../componentLayout/homeDigi/Section3"

export default function Section3Digi() {
    const content = {
        title: "Nghệ thuật đi với thời đại.",
        desc: "Chúng ta đang sống trong thời đại số, quen thuộc với công nghệ hiện đại và nghệ thuật số xây dựng chính thế giới của nó, trải nghiệm tiệm cận thực tế, cho cảm giác chân thật. Nghệ thuật số không xa lạ, nó ngay trước mắt.",
        img: "/User/img/Home_Right1.png",
        bg: "/User/img/Home_bg9.png"
    }
    return (
        <Section3
            title={content.title}
            desc={content.desc}
            img={content.img}
            bg={content.bg}
        />
    )
}