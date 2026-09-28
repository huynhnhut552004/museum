import Scene3D from "../../components/digital/explore/Scene";
import PageTransition from "../../components/comon/Animation/AnimatedPage";
import { useLanguage } from "../../routes/LanguageContext";

export default function ExploreDigital() {
  const { lang } = useLanguage();
  
  return (
    <PageTransition>
      <Scene3D lang={lang} />
    </PageTransition>
  )
}