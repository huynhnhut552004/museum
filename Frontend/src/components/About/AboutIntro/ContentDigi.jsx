import AboutIntro from "./AboutIntro";
export default function IntroDigiContent() {
    const content = {
        title: "Giới thiệu về Mosaic Museum",
        para: [
            "Nghệ thuật là những mũi thêu sắc sảo điểm lên tấm vải đời sống, khiến thế giới quanh ta trở nên sống động và giàu chiều sâu hơn. Mỗi tác phẩm đều sở hữu một vẻ đẹp riêng, nhưng cái đẹp ấy chỉ là lớp vỏ bề mặt. Phía sau nó là câu chuyện thầm lặng, là tầng ý nghĩa chìm khuất mà người xem phải tự mình khám phá. Chính hành trình giải mã những thông điệp ấy mới giúp ta thấu hiểu vẻ đẹp của thời đại, hiểu hơn về con người và về chính mình.",
            "Mosaic ra đời để kể những câu chuyện mà hội hoạ vẫn còn gửi gắm trong im lặng, để dệt nên những thước phim giàu xúc cảm từ từng mảng màu, đường nét. Xuất hiện vào năm 2025, Mosaic không chỉ là không gian trưng bày các tác phẩm nghệ thuật danh tiếng, mà còn là nơi khơi mở hành trình khám phá đằng sau mỗi bức tranh. Tại đây, mỗi tác phẩm không chỉ được nhìn ngắm, mà còn được lắng nghe: câu chuyện về người hoạ sĩ, về tâm trạng, thời đại và những mạch cảm xúc thấm vào từng nét cọ. Mosaic vì thế trở thành nơi thổi vào lòng người xem một áng văn nghệ thuật, giúp họ cảm nhận sâu hơn thông điệp mà hội hoạ gửi gắm qua thời gian."
        ],
        img: "./User/img/About_1.png",
        style: {
            heading: "Digital-Heading",
            text: "Digital-Text1"
        }
    };
    return (
        <AboutIntro
            title={content.title}
            para={content.para}
            img={content.img}
            style={content.style}
        />
    )
}