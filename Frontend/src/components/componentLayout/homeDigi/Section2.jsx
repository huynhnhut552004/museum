import Section from "../../comon/Animation/Section";
import InLeft from "../../comon/Animation/inLeft";
import InRight from "../../comon/Animation/inRight";

export default function Section2({ title, desc, img, bg }) {
    return (
        <Section className="h-screen pt-16 lg:pt-0 px-2 lg:px-0 lg:pl-6">
            <div className="w-full h-full flex flex-col lg:flex-row lg:gap-6 gap-2 items-center">
                <div className="flex-1 lg:space-y-6">
                    <InLeft className="Digital-Heading lg:leading-relaxed text-[#DB5009] lg:text-6xl uppercase font-bold">{title}</InLeft>
                    <InLeft className="Digital-Text1">{desc}</InLeft>
                </div>
                <div className="relative h-full w-screen lg:flex-1">
                    <InRight className="absolute inset-0 flex items-end justify-end">
                        <img src={bg} alt="Img" className="w-full h-auto object-cover" />
                    </InRight>
                    <InRight className="absolute inset-0 flex items-end justify-end">
                        <img src={img} alt="Img" className="w-[70%] h-auto object-contain drop-shadow-xl" />
                    </InRight>
                </div>
            </div>
        </Section>
    )
}