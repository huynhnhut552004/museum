import AboutIntroClass from "../../components/classic/about/AboutIntro";
import AboutOutroClass from "../../components/classic/about/AboutOutro";
import AboutVisionClass from "../../components/classic/about/AboutVision";
import PageTransition from "../../components/comon/Animation/AnimatedPage";

export default function About() {
  return (
    <PageTransition>
      <AboutIntroClass />
      <AboutVisionClass />
      <AboutOutroClass />
    </PageTransition>
  )
}