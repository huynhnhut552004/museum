import IntroContent from "../components/About/AboutIntro/Content";
import OutroContent from "../components/About/AboutOutro/Content";
import VisionContent from "../components/About/AboutVison/Content";
import AnimationPage from "../components/Animation/AnimatedPage";

export default function About() {
  return (
    <AnimationPage>
      <IntroContent />
      <VisionContent />
      <OutroContent />
    </AnimationPage>
  )
}