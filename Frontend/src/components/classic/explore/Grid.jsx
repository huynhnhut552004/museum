import Grid from "../../componentLayout/exploreClass/Grid";

export default function GridClass() {
    const Card = {
        title: "Khám phá các tác phẩm Việt Nam",
        card1st: { title: "Hai thiếu nữ và em bé (1944) - Tô Ngọc Vân", img: "/User/img/Explore_Grid4.png", link: "#" },
        cards: [
            { id: 1, title: "Chơi ô ăn quan (1931) - Nguyễn Phan Chánh", img: "/User/img/Explore_Grid1.png", link: "#" },
            { id: 2, title: "Vườn xuân Trung Nam Bắc (1969 - 1989) - Nguyễn Gia Trí", img: "/User/img/Explore_Grid2.png", link: "#" },
            { id: 3, title: "Tố nữ đồ - tranh dân gian", img: "/User/img/Explore_Grid3.png", link: "#" },
            { id: 4, title: "Tổ đổi công (1958) - Hoàng Tích Chù", img: "/User/img/Explore_Grid5.png", link: "#" }
        ]
    };
    return (<Grid card={Card} />
    )
}