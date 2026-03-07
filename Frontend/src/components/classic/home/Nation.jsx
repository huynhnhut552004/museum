import Nation from "../../componentLayout/homeClass/Nation";

export default function NationClass() {
    const content = [
        { title: "Thái Lan", img: "/User/img/Main_ThaiLan.png" },
        { title: "Việt Nam", img: "/User/img/Main_VietNam.png" },
        { title: "Trung Quốc", img: "/User/img/Main_TrungQuoc.png" },
        { title: "Nhật Bản", img: "/User/img/Main_NhatBan.png" }
    ];
    const defaultImg = "/User/img/Main_Nation.png";
    return (
        <Nation
            items={content}
            defaultImg={defaultImg}
        />
    )
}
