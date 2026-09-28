import Section from "../../comon/Animation/Section";
import InLeft from "../../comon/Animation/inLeft";
import InRight from "../../comon/Animation/inRight";

export default function Section1({ title, desc, img, bg, color }) {
    return (
        <Section className="relative min-h-[500px] h-screen lg:pt-0 pt-16 px-2 lg:px-0 lg:pr-6 overflow-hidden">
            <div style={{ background: color }} className="absolute lg:block hidden shadow-[inset_0_20px_30px_rgba(0,0,0,0.5)] left-[-45%] top-[35%] w-[120%] h-[600px] rotate-[50deg] z-0" />
            <div style={{ background: color }} className="absolute lg:block hidden shadow-[inset_0_-20px_30px_rgba(0,0,0,0.5)] left-[50%] top-[35%] w-[120%] h-[400px] rotate-[50deg] z-0" />
            <div className="w-full h-full lg:gap-6 gap-2 flex lg:flex-row flex-col items-center">
                <div className="flex-1 lg:order-2 order-1 lg:space-y-6 z-10 relative lg:max-w-[40%] lg:mr-auto">
                    <InRight style={{ color: color || "#fff" }} className="Digital-Heading lg:leading-relaxed lg:text-6xl uppercase font-bold mix-blend-difference">{title}</InRight>
                    <InRight className="Digital-Text1">{desc}</InRight>
                </div>
                <div className="relative lg:order-1 order-2 h-full w-full lg:w-[40%] min-h-[300px]">
                    <InLeft className="absolute inset-0 flex items-end justify-start">
                        <img src={bg} alt="Bg Img" className="w-full h-full object-contain object-left" />
                    </InLeft>
                    <InRight className="absolute inset-0 flex items-end justify-end z-10">
                        <img src={img} alt="Main Img" className="w-full h-full object-contain object-left drop-shadow-xl" />
                    </InRight>
                </div>
            </div>
        </Section>
    )
}