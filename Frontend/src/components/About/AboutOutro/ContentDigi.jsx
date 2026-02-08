import AboutOutro from "./AboutOutro";
export default function OutroDigiContent() {
    const content = {
        title: "Phát triển và chịu trách nhiệm bởi",
        para: "Công ty đầu tư và phát triển thương mại, được sự đồng ý và cấp pháp của cục di sản văn hoá, bộ văn hoá, thể thao và du lịch.",
        img: "./User/img/About_3.png",
        style: {
            heading: "Digital-Heading",
            text: "Digital-Text1"
        },
        eml: [
            {
                role: "Giám đốc công ty:",
                name: ["Nguyễn Kim Khánh"]
            },
            {
                role: "Cố vấn nghệ thuật:",
                name: [
                    "Nguyễn Ngọc Trâm Lan",
                    "Trần Kim Phụng",
                    "Đỗ Lâm Minh Khánh Quân",
                    "Phan Thị Kim Tuyền"
                ]
            },
            {
                role: "Ban pháp lý:",
                name: [
                    "Phạm Trọng Tiến Lâm",
                    "Phùng Nguyễn Chi Lan",
                    "Trương Ngọc Phú"
                ]
            },
            {
                role: "Biên kịch nội dung:",
                name: [
                    "Dương Văn Ngọc Sơn",
                    "Đinh Khiêm Ngọc",
                    "Hồ Ngọc Thuý Nguyệt",
                    "Đinh Châu Thanh"
                ]
            },
            {
                role: "Giám tuyển nghệ thuật:",
                name: [
                    "Tạ Phan Anh",
                    "Vương Văn Nghĩa",
                ]
            },
            {
                role: "Quản trị kỹ thuật:",
                name: [
                    "Phạm Đồng Lương Tiến Quốc",
                    "Hà Huyền Thy",
                    "Thái Ngọc Trọng Luân",
                    "Đỗ Mỹ Ngọc Vân",
                    "Lương Thanh Châu",
                    "Đoàn Kim Loan",
                    "Huỳnh Quốc Tuấ",
                    "Lại Thị Phúc Dung",
                    "Đỗ Ngọc Thanh Ân"
                ]
            }
        ]
    }
    return (
        <AboutOutro
            title={content.title}
            para={content.para}
            img={content.img}
            eml={content.eml}
            style={content.style}
        />
    )
}