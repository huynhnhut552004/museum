import Section1Content from "../components/HomeDigital/Section1/Content";
import Section2Content from "../components/HomeDigital/Section2/Content";
import Section3Content from "../components/HomeDigital/Section3/Content";
import Section4Content from "../components/HomeDigital/Section4/Content";
import Section5Content from "../components/HomeDigital/Section5/Content";
import PageTransition from "../components/Animation/AnimatedPage";

export default function HomeDigital() {
  return (
    <PageTransition>
      <div className="snap-section">
        <Section1Content />
      </div>
      <div className="snap-section">
        <Section2Content />
      </div>
      <div className="snap-section">
        <Section3Content />
      </div>
      <div className="snap-section">
        <Section4Content />
      </div>
      <div className="snap-section">
        <Section5Content />
      </div>
    </PageTransition>
  );
}
