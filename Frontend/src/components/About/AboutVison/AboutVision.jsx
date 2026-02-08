import AnimatedSection from "../../Animation/AnimatedSection";
import AnimatedText from "../../Animation/AnimatedText";
import AnimatedTitle from "../../Animation/AnimatedTitle";
import AnimatedMedia from "../../Animation/AnimatedMedia";

export default function AboutVision({ title, p1, p2, p3, img, style }) {
    return (
        <div className="max-w-6xl mx-auto mt-16 pb-10 lg:space-y-6 space-y-4 lg:px-0 px-4">
                <AnimatedSection>
                    <section>
                        <AnimatedTitle>
                            <div className={`${style.heading}`}>{title}</div>
                        </AnimatedTitle>
                        <AnimatedText>
                            <div className={`${style.text} lg:pl-[20%] pt-4`}>{p1}</div>
                        </AnimatedText>
                        <section className="lg:flex lg:items-start lg:gap-8 pt-4">
                            <div className="lg:w-[70%]">
                                <div className="Shadow">
                                    <AnimatedMedia direction="left">
                                        <img src={img} alt="Img" className="w-full h-auto" />
                                    </AnimatedMedia>
                                </div>
                                <AnimatedText>
                                    <div className={`${style.text} lg:hidden pt-4`}>{p2}</div>
                                </AnimatedText>
                                <AnimatedText>
                                    <div className= {`${style.text} lg:pt-8 pt-4`}>{p3}</div>
                                </AnimatedText>
                            </div>
                            <div className="flex-1">
                                <AnimatedText>
                                    <div className={`${style.text} hidden lg:block`}>{p2}</div>
                                </AnimatedText>
                            </div>
                        </section>
                    </section>
                </AnimatedSection>
        </div>
    )
}