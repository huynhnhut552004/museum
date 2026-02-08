import Produce from "./Produce";

export default function ProduceContent (){
    const Content = {
        title: "Bạn muốn tìm hiểu văn hoá nghệ thuật của các quốc gia khác nhau?",
        img: "/User/img/Main_Produce.png",
        desc: "Mosaic mang lại không gian nghệ thuật đa quốc gia, trải nghiệm văn hoá của mỗi châu lục, là những tác phẩm trường tồn qua thời gian, là những giá trị sống mãi.",
        by: "Nighthawks bởi Edward Hopper - 1942",
        nav: "Khám phá thêm →"
    };
    return(
        <Produce
            title={Content.title}
            img={Content.img}
            desc={Content.desc}
            by={Content.by}
            nav={Content.nav}
        />
    )
}