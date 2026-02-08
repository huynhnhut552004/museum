import ContentHero from "../components/Home/Hero/Content";
import IntroContent from "../components/Home/Intro/Content";
import NationContent from "../components/Home/Nation/Content";
import SpiritualContent from "../components/Home/Spiritual/Content";
import ScrollContent from "../components/Home/Scroll/Content";
import Interaction from "../components/Home/Interaction/Interaction";
import ProduceContent from "../components/Home/Produce/Content";
import AnimationPage from "../components/Animation/AnimatedPage";

export default function HomeClassic(){
    return (
        <AnimationPage>
            <ContentHero/>
            <IntroContent/>
            <ScrollContent/>
            <SpiritualContent/>
            <NationContent/>
            <ProduceContent/>
            <Interaction/>
        </AnimationPage>
    )
}