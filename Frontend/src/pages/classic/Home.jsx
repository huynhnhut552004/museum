import HeroClass from "../../components/classic/home/Hero";
import IntroClass from "../../components/classic/home/Intro";
import Interaction from "../../components/componentLayout/homeClass/Interaction";
import NationClass from "../../components/classic/home/Nation";
import SpiritualClass from "../../components/classic/home/Spiritual";
import ScrollClass from "../../components/classic/home/Scroll";
import ProduceClass from "../../components/classic/home/Produce";
import PageTransition from "../../components/comon/Animation/AnimatedPage";

export default function Home() {
    return (
        <PageTransition>
            <HeroClass />
            <IntroClass />
            <ScrollClass />
            <SpiritualClass />
            <NationClass />
            <ProduceClass />
            <Interaction />
        </PageTransition>
    )
}