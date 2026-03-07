import More from "../../componentLayout/exploreClass/More";

export default function MoreClass() {
    const content = { title: "Khám phá thêm...", desc: "Bức hoạ chất chứa câu chuyện của người nghệ sĩ.", img: "/User/img/Explore_More.png", link: "#" };
    return (
        <More
            img={content.img}
            title={content.title}
            desc={content.desc}
            link={content.link}
        />
    )
}