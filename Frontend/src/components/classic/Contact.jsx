import Contact from "../componentLayout/Contact";

export default function ContactClass() {
    const content = {
        thanks: "Cảm ơn bạn đã quan tâm",
        title1: "Thông tin liên hệ",
        hot: [
            "070698xxxx",
            "094618xxxx",
            "mosaicmuseum@gmail.com",
            "mosaic2025@gmail.com",
            "Công ty đầu tư và phát triển thương mại, Nguyễn Hữu Thọ, Tân hưng, Quận 7, thành phố Hồ Chí Minh."
        ],
        title2: "Liên hệ với chúng tôi ngay",
        fdback: "Phản hồi của bạn sẽ được trả lời trong vòng 24h tiếp theo, không tính các ngày cuối tuần.",
        style: {
            heading: "Style-Heading2",
            text: "Style-Text1",
            input: "Style-Input",
            button: "text-black"
        }
    };
    return (
        <Contact
            thanks={content.thanks}
            title1={content.title1}
            title2={content.title2}
            hot={content.hot}
            fdback={content.fdback}
            style={content.style}
        />
    )
}