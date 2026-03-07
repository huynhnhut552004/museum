import AnimatedSection from "../../comon/Animation/AnimatedSection";
import AnimatedText from "../../comon/Animation/AnimatedText";
import AnimatedTitle from "../../comon/Animation/AnimatedTitle";
import AnimatedMedia from "../../comon/Animation/AnimatedMedia";

export default function AboutVision({ title, p1, p2, p3, img, style }) {
    return (
        <div className="max-w-6xl mx-auto mt-16 pb-10 lg:space-y-6 space-y-4 lg:px-0 px-4">
            <AnimatedSection>
                <AnimatedTitle className={`${style.heading}`}>{title}</AnimatedTitle>
                <AnimatedText className={`${style.text} lg:pl-[20%] pt-4`}>{p1}</AnimatedText>
                <section className="lg:flex lg:items-start lg:gap-8 pt-4">
                    <div className="lg:w-[70%]">
                        <AnimatedMedia direction="left" className="Shadow">
                            <img src={img} alt="Img" className="w-full h-auto" />
                        </AnimatedMedia>
                        <AnimatedText className={`${style.text} lg:hidden pt-4`}>{p2}</AnimatedText>
                        <AnimatedText className={`${style.text} lg:pt-8 pt-4`}>{p3}</AnimatedText>
                    </div>
                    <div className="flex-1">
                        <AnimatedText className={`${style.text} hidden lg:block`}>{p2}</AnimatedText>
                    </div>
                </section>
            </AnimatedSection>
        </div>
    )
}