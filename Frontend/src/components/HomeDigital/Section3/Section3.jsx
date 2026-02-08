import Section from "../../Animation/Section";
import InRight from "../../Animation/inRight";
import InUp from "../../Animation/inUp";
import InDown from "../../Animation/inDown";

export default function Section3({title, desc, img, bg}) {
    return (
        <Section>
            <section className="h-screen pt-16 lg:pt-0 lg:px-0 px-2 lg:pr-6">
                <div className="w-full h-full gap-2 lg:gap-6 flex lg:flex-row flex-col items-center">
                    <div className="flex-1 lg:order-2 lg:space-y-6">
                        <InRight className="Digital-Heading lg:leading-relaxed text-[#B3010A] lg:text-6xl uppercase font-bold">{title}</InRight>
                        <InRight className="Digital-Text1">{desc}</InRight>
                    </div>
                    <div className="relative lg:order-1 h-full w-screen lg:w-[40%] ">
                        <InDown className="absolute inset-0 flex items-end justify-start">
                            <img src={bg} alt="Img" className="w-full h-full lg:h-screen object-cover" />
                        </InDown>
                        <InUp className="absolute inset-0 flex items-end justify-start">
                            <img src={img} alt="Img" className="w-[80%] h-auto object-contain drop-shadow-xl" />
                        </InUp>
                    </div>
                </div>
            </section>
        </Section>
    )
}