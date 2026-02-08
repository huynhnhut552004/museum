import ExploreBytheme from "./ExploreByTheme";

export default function ThemeContent(){
    const exploreItems = [
        { title: "Phong cách nghệ thuật", img: "/User/img/Explore_Paintstyle.png", link: "#" },
        { title: "Nghệ sĩ", img: "/User/img/Explore_Artist.png", link: "#" },
        { title: "Tác phẩm nghệ thuật", img: "/User/img/Explore_Workart.png", link: "#" },
        { title: "Chất liệu nghệ thuật", img: "/User/img/Explore_Material.png", link: "#" }
    ];
    return <ExploreBytheme items={exploreItems}/>
}