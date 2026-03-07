import Spiritual from "../../componentLayout/homeClass/Spiritual";

export default function SpiritualClass() {
    const content = {
        img: "/User/img/Main_Spiritual.png",
        title: "Văn hoá tâm linh luôn là góc nhìn thú vị.",
        nav: "Khám phá ngay →",
        desc: "Nghệ thuật văn hoá tâm linh mang một hơi thở truyền thống, mỗi đường nét, mỗi gam màu đều chứa đựng nét đẹp văn hoá, bản sắc văn tộc đậm đà. Mỗi một tác phẩm là một mảng ghép của lịch sử quốc gia."
    };
    return (
        <Spiritual
            img={content.img}
            title={content.title}
            desc={content.desc}
            nav={content.nav}
        />
    )
}


