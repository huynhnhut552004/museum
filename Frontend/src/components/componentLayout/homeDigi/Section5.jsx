import Section from "../../comon/Animation/Section";
import InLeft from "../../comon/Animation/inLeft";
import InRight from "../../comon/Animation/inRight";
import InUp from "../../comon/Animation/inUp";

export default function Section5({ title, desc, img, bg }) {
    return (
        <Section className="h-screen pt-16 lg:pt-0 px-2 lg:px-0 lg:pl-6">
            <div className="flex lg:flex-row flex-col lg:gap-6 gap-2 h-full w-full items-center justify-center mx-auto max-w-[96%]">
                <InLeft className="flex-1 lg:order-1 Digital-Heading lg:leading-relaxed text-[#F5F5F3] lg:text-6xl uppercase font-bold">{title}</InLeft>
                <InRight className="flex-1 lg:order-3 Digital-Text1">{desc}</InRight>
                <div className="relative lg:order-2 h-full w-screen lg:w-[40%]">
                    <InUp className="absolute inset-0 flex items-end justify-center">
                        <img src={bg} alt="Img" className="w-full h-full lg:h-screen object-cover" />
                    </InUp>
                    <InUp className="absolute inset-0 flex items-end justify-center">
                        <img src={img} alt="Img" className="w-[60%] h-auto object-contain drop-shadow-xl" />
                    </InUp>
                </div>
            </div>
        </Section>
    )
}