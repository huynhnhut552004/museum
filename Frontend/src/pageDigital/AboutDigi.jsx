import IntroDigiContent from "../components/About/AboutIntro/ContentDigi";
import OutroDigiContent from "../components/About/AboutOutro/ContentDigi";
import VisionDigiContent from "../components/About/AboutVison/ContentDigi";
import AnimationPage from "../components/Animation/AnimatedPage";

export default function AboutDigi() {
  return (
    <AnimationPage>
      <IntroDigiContent />
      <VisionDigiContent />
      <OutroDigiContent />
    </AnimationPage>
  )
}