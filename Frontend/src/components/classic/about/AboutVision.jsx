import AboutVision from "../../componentLayout/about/AboutVision";

export default function AboutVisionClass() {
    const content = {
        title: "Lưu trữ - giao thoa - Lan toả",
        p1: "Được thành lập và phát triển bởi XX, người mang trong mình niềm đam mê sâu sắc đối với hội hoạ và khát vọng tìm hiểu những giá trị văn hoá đa dạng trên thế giới. Với mong muốn kiến tạo một không gian nơi mọi người có thể gặp gỡ, giao lưu và mở rộng hiểu biết về các nền văn hoá khác nhau, ông đã xây dựng ý tưởng Mosaic như một điểm đến nghệ thuật đúng nghĩa. Tại đây, công chúng không chỉ có cơ hội chiêm ngưỡng những tác phẩm đến từ nhiều quốc gia, mà còn được đắm mình trong hành trình khám phá các câu chuyện, tư tưởng và tinh thần mà chúng đại diện.",
        p2: "“Mosaic” vốn là tên của một loại hình nghệ thuật ghép nối những mảnh hoa văn rời rạc để tạo nên một tổng thể hài hoà. Chúng tôi chọn cái tên này vì nó biểu trưng cho sự giao thoa văn hoá – giá trị cốt lõi mà Mosaic theo đuổi. Tại đây, mỗi tác phẩm nghệ thuật đến từ một nền văn hoá khác nhau được xem như một mảnh ghép độc đáo, góp phần hình thành nên bức tranh lớn mang dấu ấn hội nhập và đa sắc của thế giới. Mosaic không chỉ trưng bày nghệ thuật, mà còn trình hiện hành trình hoà quyện giữa những bản sắc, những câu chuyện và những cảm xúc đến từ khắp nơi, tạo nên một không gian nơi cái đẹp được kết nối và lan toả.",
        p3: "Tại Mosaic, chúng tôi tin rằng nghệ thuật không bị giới hạn bởi biên giới địa lý hay rào cản văn hoá; bất kỳ ai cũng có thể tiếp cận, tìm hiểu và chiêm ngưỡng nghệ thuật ở bất cứ đâu. Chúng tôi mong muốn trở thành cầu nối để cộng đồng có cơ hội giao lưu, học hỏi và chia sẻ những trải nghiệm đa chiều về nghệ thuật. Sứ mệnh của Mosaic là gìn giữ và bảo tồn các tác phẩm nghệ thuật vô giá, lưu giữ giá trị của chúng qua thời gian và truyền tải trọn vẹn đến các thế hệ mai sau. Song hành với điều đó, chúng tôi cam kết tuyệt đối tôn trọng quyền tác giả, cung cấp thông tin tác quyền chính xác, minh bạch, và đảm bảo mỗi tác phẩm luôn được ghi nhận đúng với giá trị cũng như chủ thể sáng tạo của nó.",
        img: "./User/img/About_2.png",
        style: {
            heading: "Style-Heading2",
            text: "Style-Text1",
        }
    }
    return (
        <AboutVision
            title={content.title}
            p1={content.p1}
            p2={content.p2}
            p3={content.p3}
            img={content.img}
            style={content.style}
        />
    )
}