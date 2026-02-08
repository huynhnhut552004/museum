import Section from "../../Animation/Section";
import InLeft from "../../Animation/inLeft";
import InRight from "../../Animation/inRight";

export default function Section1({title, desc, img, bg}) {
    return (
        <Section>
            <section className="h-screen lg:pt-0 pt-16 px-2 lg:px-0 lg:pr-6">
                <div className="w-full h-full lg:gap-6 gap-2 flex lg:flex-row flex-col items-center">
                    <div className="flex-1 lg:order-2 order-1 lg:space-y-6">
                        <InRight className="Digital-Heading lg:leading-relaxed text-[#526590] lg:text-6xl uppercase font-bold">{title}</InRight>
                        <InRight className="Digital-Text1">{desc}</InRight>
                    </div>
                    <div className="relative lg:order-1 order-2 h-full w-screen lg:w-[40%] ">
                        <InLeft className="absolute inset-0 flex items-end justify-start">
                            <img src={bg} alt="Img" className="w-full lg:h-screen h-full object-cover" />
                        </InLeft>
                        <InRight className="absolute inset-0 flex items-end lg:justify-center justify-end">
                            <img src={img} alt="Img" className="w-[70%] h-auto object-contain drop-shadow-xl" />
                        </InRight>
                    </div>
                </div>
            </section>
        </Section>
    )
}