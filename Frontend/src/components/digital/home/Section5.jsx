import Section from "../../comon/Animation/Section";
import InLeft from "../../comon/Animation/inLeft";
import InRight from "../../comon/Animation/inRight";
import InUp from "../../comon/Animation/inUp";

export default function Section5({ title, desc, img, bg, color }) {
    return (
        <Section className="relative min-h-[500px] h-screen pt-16 lg:pt-0 px-2 lg:px-0 lg:pl-6 overflow-hidden">
            <div style={{ background: color }} className="absolute lg:block hidden shadow-[inset_0_20px_30px_rgba(0,0,0,0.5)] left-[0%] top-[-35%] w-[120%] h-[400px] rotate-[180deg] z-0" />
            <div style={{ background: color }} className="absolute lg:block hidden shadow-[inset_0_-20px_30px_rgba(0,0,0,0.5)] left-[0%] top-[80%] w-[120%] h-[600px] rotate-[180deg] z-0" />
            <div className="flex lg:flex-row flex-col lg:gap-6 gap-2 h-full w-full items-center justify-center mx-auto max-w-[96%]">
                <InLeft style={{ color: color || "#fff" }} className="flex-1 lg:order-1 order-1 Digital-Heading lg:leading-relaxed lg:text-6xl uppercase font-bold relative z-10">
                    {title}
                </InLeft>
                <InRight className="flex-1 lg:order-3 order-2 Digital-Text1 relative z-10">
                    {desc}
                </InRight>
                <div className="relative lg:order-2 order-3 h-full w-full lg:w-[40%] min-h-[300px]">
                    <InUp className="absolute inset-0 flex items-end justify-center">
                        <img src={bg} alt="Bg Img" className="w-full h-full object-contain object-bottom" />
                    </InUp>
                    <InUp className="absolute inset-0 flex items-end justify-center z-10">
                        <img src={img} alt="Main Img" className="w-full h-full object-contain object-bottom drop-shadow-xl" />
                    </InUp>
                </div>
            </div>
        </Section>
    )
}