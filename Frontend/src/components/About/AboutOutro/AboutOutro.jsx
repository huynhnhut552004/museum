import AnimatedSection from "../../Animation/AnimatedSection";
import AnimatedText from "../../Animation/AnimatedText";
import AnimatedTitle from "../../Animation/AnimatedTitle";
import AnimatedMedia from "../../Animation/AnimatedMedia";

export default function AboutOutro({ title, para, img, eml, style }) {
  return (
    <div className="max-w-6xl mx-auto mt-16 pb-10 lg:space-y-6 space-y-4 lg:px-0 px-4">
      <AnimatedSection>
        <section>
          <AnimatedTitle>
            <div className={`${style.heading} lg:text-right`}>{title}</div>
          </AnimatedTitle>
          <AnimatedText>
            <div className={`${style.text} pt-4`}>{para}</div>
          </AnimatedText>
          <div className="lg:flex gap-8 pt-4">
            <div className="w-[70%] lg:ml-0 ml-auto">
              <AnimatedMedia direction="left">
                <img src={img} alt="Img" className="w-full h-full" />
              </AnimatedMedia>
            </div>
            <div className="flex-1">
              {eml.map((item, index) => (
                <div key={index}>
                  <AnimatedTitle>
                    <div className={`${style.text} pt-4`}>{item.role}</div>
                  </AnimatedTitle>
                  {item.name.map((n, index) => (
                    <AnimatedText key={index}>
                      <div className={`${style.text}`} >{n}</div>
                    </AnimatedText>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  )
}