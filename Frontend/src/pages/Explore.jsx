import AnimationPage from "../components/Animation/AnimatedPage";
import ThemeContent from "../components/Explore/Theme/ContentClassic";
import HeroClassic from "../components/Explore/Hero/ContentClassic";
import StoryClassic from "../components/Explore/Story/ContentClassic";
import TraditionsClassic from "../components/Explore/Traditions/ContentClassic";
import GridClassic from "../components/Explore/Grid/ContentClassic";
import ColorClassic from "../components/Explore/Color/ContentClassic";
import VideoClassic from "../components/Explore/Video/ContentClassic";
import SlideClassic from "../components/Explore/Slide/ContentClassic";
import ZoomImgClassic from "../components/Explore/ZoomImg/ContentClassic";
import MoreClassic from "../components/Explore/More/ContentClassic";

export default function Explore() {
    return (
        <AnimationPage>
            <HeroClassic />
            <ThemeContent/>
            <StoryClassic/>
            <TraditionsClassic/>
            <GridClassic/>
            <VideoClassic/>
            <ColorClassic/>
            <ZoomImgClassic/>
            <SlideClassic/>
            <MoreClassic/>
        </AnimationPage>
    )
}