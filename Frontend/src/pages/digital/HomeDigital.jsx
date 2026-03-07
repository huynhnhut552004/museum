import Section1Digi from "../../components/digital/home/Section1";
import Section2Digi from "../../components/digital/home/Section2";
import Section3Digi from "../../components/digital/home/Section3";
import Section4Digi from "../../components/digital/home/Section4";
import Section5Digi from "../../components/digital/home/Section5";
import PageTransition from "../../components/comon/Animation/AnimatedPage";

export default function HomeDigital() {
  return (
    <PageTransition>
      <div className="snap-section">
        <Section1Digi />
      </div>
      <div className="snap-section">
        <Section2Digi />
      </div>
      <div className="snap-section">
        <Section3Digi />
      </div>
      <div className="snap-section">
        <Section4Digi />
      </div>
      <div className="snap-section">
        <Section5Digi />
      </div>
    </PageTransition>
  );
}
