import Hero from "../../componentLayout/exploreClass/Hero";
export default function HeroClass() {
    const content = {
        imgL: "/User/img/Explore_1.png",
        imgR: "/User/img/Explore_2.png",
        title1: "Tác phẩm trong nước →",
        title2: " Tác phẩm quốc tế →",
        linkL: "#",
        linkR: "#"
    };
    return (
        <Hero
            imgL={content.imgL}
            imgR={content.imgR}
            title1={content.title1}
            title2={content.title2}
            linkL={content.linkL}
            linkR={content.linkR}
        />
    )
}