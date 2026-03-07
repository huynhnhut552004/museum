import Tradition from "../../componentLayout/exploreClass/tradition/Tradition";

export default function TraditionClass(){
    const Grallery = [
            { id: 1, title: "Thuỷ mặc", img: "/User/img/Explore_ThuyMac.png", desc: "Trung Quốc", link: "#" },
            { id: 2, title: "Ukiyo-e", img: "/User/img/Explore_ukiyo-e.png", desc: "Nhật Bản", link: "#" },
            { id: 3, title: "Đông hồ", img: "/User/img/Explore_DongHo.png", desc: "Việt Nam", link: "#" },
            { id: 4, title: "Miniature Paintin", img: "/User/img/Explore_MiniaturePaintin.png", desc: "Ấn Độ", link: "#" },
            { id: 5, title: "Phù điêu Angkor", img: "/User/img/Explore_PhuDieuAngkor.png", desc: "Campuchia", link: "#" }
        ];
        return (
            <Tradition items={Grallery}/>
        )
}