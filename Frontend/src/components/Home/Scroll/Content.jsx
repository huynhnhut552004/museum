import Scroll from "./Scroll";

export default function ScrollContent(){
    const content={
        img: "/User/img/Main_Scroll.png",
        desc1:{
            title: "Mặt trăng vàng",
            desc: "Sử dụng màu vàng rực rỡ vẽ thành các đường tròn đồng tâm thể hiện hy vọng dẫn đường cho hoạ sĩ. Mặt trăng vàng tạo nên sự ấm áp giữa bầu trời lạnh lẽo."
        },
        desc2:{
            title: "Cây Bách",
            desc: "Sử dụng tông màu trầm tối vẽ như ngọn lửa đen bùng lên tương phản với bầu trời, là cầu nối giữa mặt đất với bầu trời đại diện cho sự kiên cường vươn lên, thể hiện nỗi cô đơn của hoạ sĩ."
        },
        desc3:{
            title: "Làng mạc",
            desc: "Ngôi làng đại diện cho sự bình yên, cho thế giới thực tại trong khi bầu trời cuộn như bão tố. Mang lại cảm giác nhỏ bé yên bình trước sức mạnh vĩ đại của bầu trời."

        }, 
        desc4: {
            title: "The Starry Night",
            desc: "Vincent van Gogh"
        }
    };
    return (
        <Scroll
            img={content.img}
            desc1={content.desc1}
            desc2={content.desc2}
            desc3={content.desc3}
            desc4={content.desc4}
        />
    )
}




