import ZoomableImage from "./ZoomPoints";

export default function ZoomImgClassic() {
    const Content = {
        img: "/User/img/Explore_Zoom.png",
        title: "Bữa ăn cuối cùng, Leonardo da Vinc 1495-1498.",
        desc: "Nhấp vào chấm để phóng to và tìm hiểu thêm."
    }
    const hotspots = [
    { id: 1, top: '65%', left: '25%', zoomX: '25%', zoomY: '-10%', scale: 2, title: "Tay phải của Chúa Jesus", desc: "Bàn tay phải mở ra hướng về chiếc bánh mì và ly rượu, tượng trưng cho sự ban phước và hiến dâng." },
    { id: 2, top: '63%', left: '51%', zoomX: '0%', zoomY: '-9%', scale: 3, title: "Chúa Jesus", desc: "Trung tâm của bức tranh. Gương mặt ngài thể hiện sự điềm tĩnh nhưng đượm buồn khi thông báo có kẻ phản bội." },
    { id: 3, top: '65%', left: '75%', zoomX: '-25%', zoomY: '-10%', scale: 2, title: "Nhóm môn đồ", desc: "Các môn đồ đang bàn tán xôn xao, thể hiện nhiều cung bậc cảm xúc từ nghi ngờ, sợ hãi đến tức giận." },
    { id: 4, top: '20%', left: '50%', zoomX: '0%', zoomY: '20%', scale: 2, title: "Kiến trúc vòm", desc: "Việc sử dụng phối cảnh điểm tụ giúp mọi đường nét kiến trúc đều hướng sự tập trung về phía Chúa Jesus." },
    { id: 5, top: '20%', left: '20%', zoomX: '25%', zoomY: '25%', scale: 2, title: "Ánh sáng và Bóng tối", desc: "Kỹ thuật Chiaroscuro được sử dụng để tạo chiều sâu và kịch tính cho không gian bữa tiệc." }
  ];
    return (
        <ZoomableImage
            img={Content.img}
            title={Content.title}
            desc={Content.desc}
            hotspots={hotspots}
        />
    )
}
