import Intro from "../../componentLayout/homeClass/Intro";

export default function IntroClass() {
    const content = {
        title: "Đã bao giờ bạn nhìn vào tác phẩm nghệ thuật mà tò mò ý nghĩa của nó?",
        desc: "Hãy cùng Mosaic trải nghiệm từng đường nét nghệ thuật của tác phẩm, từng thông điệp câu chuyện mà tác giả muốn gửi gắm, thêu dệt nên những câu chuyện đầy cảm hứng, khám phá từng lớp ý nghĩa ẩn chứa bên trong.",
        img: "/User/img/Main_Intro.png",
        nav: "Khám phá ngay →"
    };
    return (
        <Intro
            title={content.title}
            desc={content.desc}
            img={content.img}
            nav={content.nav}
        />
    )
}
