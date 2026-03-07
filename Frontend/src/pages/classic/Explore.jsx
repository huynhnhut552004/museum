import PageTransition from "../../components/comon/Animation/AnimatedPage";
import ThemeClass from "../../components/classic/explore/Theme";
import HeroClass from "../../components/classic/explore/Hero";
import StoryClass from "../../components/classic/explore/Story";
import TraditionClass from "../../components/classic/explore/Tradition";
import GridClass from "../../components/classic/explore/Grid";
import ColorClass from "../../components/classic/explore/Color";
import VideoClass from "../../components/classic/explore/Video";
import SlideClass from "../../components/classic/explore/Slide";
import ZoomPointClass from "../../components/classic/explore/ZoomPoint";
import MoreClass from "../../components/classic/explore/More";

export default function Explore() {
    return (
        <PageTransition>
            <HeroClass />
            <ThemeClass/>
            <StoryClass/>
            <TraditionClass/>
            <GridClass/>
            <VideoClass/>
            <ColorClass/>
            <ZoomPointClass/>
            <SlideClass/>
            <MoreClass/>
        </PageTransition>
    )
}