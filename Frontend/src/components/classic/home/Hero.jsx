import Hero from "../../componentLayout/homeClass/Hero";
export default function HeroClass() {
    const content = { video: "/User/Video/Main_Hero.mp4", title: "Khám phá nghệ thuật qua màn ảnh." };
    return (
        <Hero
            video={content.video}
            title={content.title}
        />
    )
}

