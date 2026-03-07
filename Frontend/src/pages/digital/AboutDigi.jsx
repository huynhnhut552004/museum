import AboutIntroDigi from "../../components/digital/about/AboutIntro";
import AboutOutroDigi from "../../components/digital/about/AboutOutro";
import AboutVisionDigi from "../../components/digital/about/AboutVision";
import PageTransition from "../../components/comon/Animation/AnimatedPage";

export default function AboutDigital() {
  return (
    <PageTransition>
      <AboutIntroDigi />
      <AboutVisionDigi />
      <AboutOutroDigi />
    </PageTransition>
  )
}