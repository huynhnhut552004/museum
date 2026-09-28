import Section from "../../comon/Animation/Section";
import InLeft from "../../comon/Animation/inLeft";
import InRight from "../../comon/Animation/inRight";

export default function Section2({ title, desc, img, bg, color }) {
    return (
        <Section className="relative min-h-[500px] h-screen pt-16 lg:pt-0 px-2 lg:px-0 lg:pl-6 overflow-hidden">
            <div style={{ background: color }} className="absolute lg:block hidden shadow-[inset_0_-20px_30px_rgba(0,0,0,0.5)] left-[-75%] top-[35%] w-[120%] h-[400px] rotate-[-50deg] z-0" />
            <div style={{ background: color }} className="absolute lg:block hidden shadow-[inset_0_20px_30px_rgba(0,0,0,0.5)] left-[25%] top-[35%] w-[120%] h-[600px] rotate-[-50deg] z-0" />
            <div className="w-full h-full flex flex-col lg:flex-row lg:gap-6 gap-2 items-center">
                <div className="flex-1 lg:space-y-6 relative z-10 lg:max-w-[40%] lg:ml-auto">
                    <InLeft style={{ color: color || "#fff" }} className="Digital-Heading lg:leading-relaxed lg:text-6xl uppercase font-bold">{title}</InLeft>
                    <InLeft className="Digital-Text1">{desc}</InLeft>
                </div>
                <div className="relative h-full w-full lg:w-[40%] min-h-[300px]">
                    <InRight className="absolute inset-0 flex items-end justify-end">
                        <img src={bg} alt="Bg Img" className="w-full h-full object-contain object-right" />
                    </InRight>
                    <InRight className="absolute inset-0 flex items-end justify-end z-10">
                        <img src={img} alt="Main Img" className="w-full h-full object-contain object-right drop-shadow-xl" />
                    </InRight>
                </div>
            </div>
        </Section>
    )
}