import AnimatedSection from "../../comon/Animation/AnimatedSection";
import AnimatedText from "../../comon/Animation/AnimatedText";
import AnimatedTitle from "../../comon/Animation/AnimatedTitle";
import AnimatedMedia from "../../comon/Animation/AnimatedMedia";

export default function AboutOutro({ title, para, img, eml, style }) {
  return (
    <div className="max-w-6xl mx-auto mt-16 pb-10 lg:space-y-6 space-y-4 lg:px-0 px-4">
      <AnimatedSection>
        <AnimatedTitle className={`${style.heading} lg:text-right`}>{title}</AnimatedTitle>
        <AnimatedText className={`${style.text} pt-4`}>{para}</AnimatedText>
        <div className="lg:flex gap-8 pt-4">
          <AnimatedMedia direction="left" className="w-[70%] lg:ml-0 ml-auto">
            <img src={img} alt="Img" className="w-full h-full" />
          </AnimatedMedia>
          <div className="flex-1">
            {eml.map((item, index) => (
              <div key={index}>
                <AnimatedTitle className={`${style.text} pt-4`}>{item.role}</AnimatedTitle>
                {item.name.map((n, index) => (
                  <AnimatedText key={index}>
                    <div className={`${style.text}`} >{n}</div>
                  </AnimatedText>
                ))}
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </div>
  )
}