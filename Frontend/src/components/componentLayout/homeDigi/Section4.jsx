import Section from "../../comon/Animation/Section";
import InLeft from "../../comon/Animation/inLeft";
import InRight from "../../comon/Animation/inRight";
import InUp from "../../comon/Animation/inUp";

export default function Section4({ title, desc, img, bg }) {
    return (
        <Section className="h-screen pt-16 lg:pt-0 px-2 lg:px-0 lg:pl-6">
            <div className="w-full h-full flex lg:flex-row flex-col gap-2 lg:gap-6 items-center">
                <div className="flex-1 lg:space-y-6">
                    <InLeft className="Digital-Heading lg:leading-relaxed text-[#3179b9] lg:text-6xl uppercase font-bold">{title}</InLeft>
                    <InLeft className="Digital-Text1">{desc}</InLeft>
                </div>
                <div className="relative h-full w-screen lg:flex-1">
                    <InUp className="absolute inset-0 flex items-end justify-around">
                        <img src={bg} alt="Img" className="lg:w-[70%] w-screen lg:h-screen h-full object-cover" />
                    </InUp>
                    <InRight className="absolute inset-0 flex items-end justify-end">
                        <img src={img} alt="Img" className="w-[55%] h-auto object-contain drop-shadow-xl" />
                    </InRight>
                </div>
            </div>
        </Section>
    )
}