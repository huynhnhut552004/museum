import Slide from "./Slide";

export default function SlideClassic() {
    const Card = [
        { id: 1, img: "/User/img/Explore_Slide1.png", title: "Mona Lisa", desc: "Leonardo da Vinci 1503-1506", link:"#" },
        { id: 2,img: "/User/img/Explore_Slide2.png", title: "Sự sáng tạo của Adam", desc: "Michelangelo 1512", link:"#" },
        { id: 3,img: "/User/img/Explore_Slide3.png", title: "Sự ra đời của Venus", desc: "Sandro Botticelli 1486", link:"#" },
        { id: 4,img: "/User/img/Explore_Slide4.png", title: "Mùa xuân", desc: "- Sandro Botticelli 1477-1482", link:"#" },
        { id: 5,img: "/User/img/Explore_Slide5.png", title: "Đám cưới tại Cana", desc: "Paolo Veronese 1563", link:"#" },
        { id: 6,img: "/User/img/Explore_Slide6.png", title: "Chân dung Arnolfini", desc: "Jan van Eyck 1434", link:"#" },
        { id: 7,img: "/User/img/Explore_Slide7.png", title: "Bức bàn thờ Ghent", desc: "Jan van Eyck & Hubert van Eyck 1432", link:"#" },
        { id: 8,img: "/User/img/Explore_Slide8.png", title: "Trường học Athens", desc: "Raphael 1511", link:"#" }
    ];
    return <Slide items={Card} />;
}