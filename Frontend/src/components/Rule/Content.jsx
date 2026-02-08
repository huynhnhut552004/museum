import RuleLayout from "./Rule";

export default function RuleContent() {
    const content = [{
        id: 1,
        title: "Điều khoản và chính sách",
        para: [
            "Trang web này được vận hành với mục đích chia sẻ, tổng hợp và giới thiệu các tác phẩm nghệ thuật, hình ảnh, thông tin và tư liệu từ nhiều nguồn, nhiều quốc gia và nền văn hóa khác nhau nhằm mục đích tham khảo phi thương mại. Khi truy cập hoặc sử dụng trang web, bạn xác nhận rằng mình đã đọc, hiểu và đồng ý tuân thủ toàn bộ Điều khoản Sử dụng và Chính sách Bảo mật dưới đây.",
            "Chúng tôi có thể điều chỉnh các nội dung này theo thời gian; mọi thay đổi sẽ được công bố công khai trên trang web và chỉ có hiệu lực từ thời điểm đăng tải, không áp dụng hồi tố. Bạn nên xem lại trang này thường xuyên để cập nhật."
        ]
    },
    {
        id: 2,
        title: "Mục đích phi thương mại",
        para: [
            "Trang web không kinh doanh, không buôn bán, không cung cấp dịch vụ thu phí và không sử dụng bất kỳ nội dung nào cho mục đích thương mại. Mọi tác phẩm, hình ảnh, tư liệu trên trang đều thuộc quyền sở hữu của tác giả hoặc đơn vị cung cấp nguồn, được hiển thị dưới hình thức tham khảo, nghiên cứu và thưởng lãm phi lợi nhuận."
        ]
    },
    {
        id: 3,
        title: "Quyền tác giả và sở hữu trí tuệ",
        para: [
            "Tất cả các nội dung được tổng hợp trên trang web đều thuộc về bên sở hữu gốc. Chúng tôi tôn trọng luật bản quyền và luôn nêu rõ nguồn tham khảo (nếu được cung cấp). Bạn không được sao chép, tái sử dụng, chỉnh sửa, phân phối, khai thác hoặc sử dụng nội dung trên trang vào mục đích thương mại khi chưa có sự cho phép của tác giả hoặc chủ sở hữu quyền hợp pháp.",
            "Nếu bạn là chủ sở hữu của một tác phẩm xuất hiện trên trang và muốn yêu cầu gỡ xuống, chỉnh sửa ghi nguồn, hoặc phản ánh vi phạm, vui lòng liên hệ qua biểu mẫu “Liên hệ” để chúng tôi xử lý trong thời gian sớm nhất."
        ]
    },
    {
        id: 4,
        title: "Giới hạn trách nhiệm",
        para: [
            "Do nội dung được tổng hợp từ nhiều nền văn hóa, quốc gia và thời kỳ khác nhau, một số hình ảnh hoặc tác phẩm có thể không phù hợp với quan điểm cá nhân của từng người xem. Trang web không chịu trách nhiệm đối với bất kỳ cảm xúc, sự xúc phạm, khó chịu, hiểu nhầm, hoặc phản ứng tiêu cực nào phát sinh từ việc tiếp cận nội dung.",
            "Chúng tôi không bảo đảm rằng mọi thông tin đều chính xác, đầy đủ hoặc cập nhật tại mọi thời điểm. Việc sử dụng nội dung trên trang là do bạn tự quyết định và tự chịu rủi ro.",
            "Trang web không chịu trách nhiệm cho thiệt hại gián tiếp, hệ quả, kỹ thuật, hay mất mát dữ liệu phát sinh từ việc bạn truy cập, sử dụng hoặc không thể sử dụng trang web."
        ]
    },
    {
        id: 5,
        title: "Liên kết bên thứ ba",
        para: [
            "Trang web có thể hiển thị liên kết đến các trang khác nhằm tham khảo nguồn. Chúng tôi không kiểm soát, quản lý hoặc bảo đảm chất lượng nội dung của các trang bên ngoài và không chịu trách nhiệm đối với bất kỳ thiệt hại hoặc hiểu nhầm nào khi bạn truy cập các đường dẫn này."
        ]
    },
    {
        id: 6,
        title: "Thu thập thông tin cá nhân",
        para: [
            "Chúng tôi chỉ thu thập các thông tin cá nhân khi bạn tự nguyện gửi qua biểu mẫu liên hệ, bao gồm: Tên (không bắt buộc), địa chỉ email, nội dung phản hồi, góp ý, thắc mắc hoặc khiếu nại. Thông tin được sử dụng duy nhất để: Phản hồi yêu cầu của bạn, duy trì liên lạc khi cần thiết, cải thiện chất lượng vận hành nội bộ.",
            "Chúng tôi không bán hàng, không gửi quảng cáo, và không thực hiện bất kỳ hoạt động kinh doanh nào liên quan đến dữ liệu cá nhân."
        ]
    },
    {
        id: 7,
        title: "Dữ liệu kỹ thuật và Cookie",
        para: [
            "Khi bạn truy cập trang web, hệ thống có thể tự động thu thập một số thông tin kỹ thuật không định danh cá nhân như: Loại trình duyệt, ngày và thời gian truy cập, các trang bạn xem, trang web giới thiệu đến chúng tôi.",
            "Cookie có thể được sử dụng nhằm cải thiện trải nghiệm người dùng, phân tích hiệu suất và quản lý trang web. Cookie không thu thập thông tin cá nhân trừ khi bạn tự nguyện cung cấp trước đó. Bạn có thể tắt cookie trong cài đặt trình duyệt nếu muốn."
        ]
    },
    {
        id: 8,
        title: "Phân phối thông tin",
        para: [
            "Chúng tôi không bán, không chia sẻ và không trao đổi thông tin cá nhân cho bên thứ ba, trừ các trường hợp: Khi luật pháp yêu cầu, khi cần bảo vệ quyền lợi hợp pháp của trang web, khi cần xử lý gian lận, tấn công kỹ thuật hoặc vi phạm bảo mật.",
            "Ngoài các trường hợp trên, dữ liệu chỉ được tiếp cận bởi các nhân sự hoặc đơn vị kỹ thuật được ủy quyền, có cam kết bảo mật."
        ]
    },
    {
        id: 9,
        title: "Bảo mật thông tin",
        para: [
            "Chúng tôi áp dụng các biện pháp hợp lý nhằm bảo vệ dữ liệu cá nhân khỏi truy cập trái phép, rò rỉ hoặc sửa đổi. Tuy nhiên, bạn hiểu rằng không hệ thống nào có thể đảm bảo an toàn tuyệt đối, và việc gửi thông tin qua internet luôn tiềm ẩn rủi ro."
        ]
    },
    {
        id: 10,
        title: "Quyền của người dùng",
        para: [
            "Bạn có quyền yêu cầu: Truy cập dữ liệu cá nhân của mình, chỉnh sửa thông tin sai hoặc không đầy đủ, yêu cầu xóa thông tin khi không còn cần thiết. Vui lòng gửi yêu cầu qua mục “Liên hệ”."
        ]
    },
    {
        id: 11,
        title: "Thời hạn áp dụng",
        para: [
            "Điều khoản và Chính sách này có hiệu lực trong suốt thời gian trang web hoạt động. Mọi thay đổi sẽ được thông báo công khai tại trang này."
        ]
    },
    {
        id: 12,
        title: "Liên hệ",
        para: [
            "Nếu bạn có câu hỏi, yêu cầu chỉnh sửa thông tin, khiếu nại bản quyền, hoặc góp ý liên quan đến hoạt động của trang web, vui lòng liên hệ qua biểu mẫu “Liên hệ”. Chúng tôi cam kết phản hồi trong thời gian sớm nhất có thể."
        ]
    }];
    const style = {
        heading: "Style-Heading2",
        text: "Style-Text2",
        input: "Style-Input",
        button: "text-black"
    }
    return (
        <RuleLayout
            items={content}
            style={style}
        />
    )
}