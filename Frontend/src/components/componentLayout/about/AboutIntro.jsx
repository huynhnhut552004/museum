import AnimatedSection from "../../comon/Animation/AnimatedSection";
import AnimatedText from "../../comon/Animation/AnimatedText";
import AnimatedTitle from "../../comon/Animation/AnimatedTitle";
import AnimatedMedia from "../../comon/Animation/AnimatedMedia";

export default function AboutIntro({ title, para, img, style }) {
    return (
        <div className="max-w-6xl mx-auto pb-10 lg:space-y-6 space-y-4 lg:px-0 px-4">
            <AnimatedSection>
                <AnimatedTitle className={`${style.heading} lg:text-6xl text-2xl text-center lg:pb-6 pb-4`}>{title}</AnimatedTitle>
                <section className="lg:flex lg:gap-8 lg:items-start">
                    <div className="lg:w-[50%] space-y-4">
                        {para.map((text, index) => (
                            <AnimatedText key={index}>
                                <div className={`${style.text}`}>{text}</div>
                            </AnimatedText>
                        ))}
                    </div>
                    <AnimatedMedia direction="right" className="lg:w-[50%] w-[70%] lg:ml-0 ml-auto mt-4 lg:mt-[30vh] Shadow">
                        <img src={img} alt="Img" className="object-cover w-full h-full" />
                    </AnimatedMedia>
                </section>
            </AnimatedSection>
        </div>
    )
}