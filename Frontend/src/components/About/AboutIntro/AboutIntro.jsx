import AnimatedSection from "../../Animation/AnimatedSection";
import AnimatedText from "../../Animation/AnimatedText";
import AnimatedTitle from "../../Animation/AnimatedTitle";
import AnimatedMedia from "../../Animation/AnimatedMedia";

export default function AboutIntro({ title, para, img, style}) {
    return (
        <div className="max-w-6xl mx-auto pb-10 lg:space-y-6 space-y-4 lg:px-0 px-4">
            <AnimatedSection>
                <section>
                    <AnimatedTitle>
                        <div className={`${style.heading} lg:text-6xl text-2xl text-center lg:pb-6 pb-4`}>{title}</div>
                    </AnimatedTitle>
                    <section className="lg:flex lg:gap-8 lg:items-start">
                        <div className="lg:w-[50%] space-y-4">
                            {para.map((text, index) => (
                                <AnimatedText key={index}>
                                    <div className={`${style.text}`}>{text}</div>
                                </AnimatedText>
                            ))}
                        </div>
                        <div className="lg:w-[50%] w-[70%] lg:ml-0 ml-auto mt-4 lg:mt-[30vh] Shadow">
                            <AnimatedMedia direction="right">
                                <img src={img} alt="Img" className="object-cover w-full h-full" />
                            </AnimatedMedia>
                        </div>
                    </section>
                </section>
            </AnimatedSection>
        </div>
    )
}