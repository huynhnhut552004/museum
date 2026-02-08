import Video from "./Video";

export default function VideoClassic(){
    const Videos ={video:"/User/Video/Explore_Video.mp4", title:"Khám phá nét vẽ của vẻ đẹp", link:"#"};
    return(
        <Video
            video={Videos.video}
            title={Videos.title}
            link={Videos.link}
        />
    )
}