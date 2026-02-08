import { useRef } from "react";
import useAnimatedSlide from "../../Animation/AnimatedSlide";
import { Data } from "./Content";
import AnimatedSection from "../../Animation/AnimatedSection";

export default function Interaction() {
    const containerRef = useRef(null);
    const bgImgRef = useRef(null);
    const textRef = useRef(null);
    const thisImgRef = useRef(null);
    const nextImgRef = useRef(null);
    const frameRef = useRef(null);

    const { activeIndex, changeSlide } = useAnimatedSlide({
        containerRef,
        bgImgRef,
        textRef,
        thisImgRef,
        nextImgRef,
        frameRef,
        content: Data
    });
    const currentSlide = Data[activeIndex];

    return (
        <AnimatedSection>
        <section ref={containerRef} className="h-screen flex items-end">
            <div className="relative h-[95%] w-full overflow-hidden bg-black cursor-none flex items-center justify-center">
                <div ref={bgImgRef} className="absolute inset-0">
                    <img src={currentSlide.image} alt="Img" className="w-full h-full object-cover filter blur-md scale-110" />
                    <div className="absolute w-full h-full inset-0 bg-black/40" />
                </div>
                <div className="absolute lg:top-[10%] lg:left-[5%] top-[5%] left-[80%] pointer-events-none">
                    <span className="Style-Text1 text-white">0{activeIndex + 1}/0{Data.length}</span>
                </div>
                <div ref={textRef} className="absolute w-full lg:h-[90%] h-[80%] flex flex-col justify-between items-center">
                    <div className="Style-Heading2 text-white">{currentSlide.title}</div>
                    <div className="flex flex-col items-center">
                        <div className="Style-Text1 text-white text-center lg:text-left">{currentSlide.desc}</div>
                        <div className="Style-Text1 text-white">{currentSlide.by}</div>
                    </div>
                </div>
                <div ref={frameRef} className="relative shadow-xl border-[2px] border-white/80 rounded-lg overflow-hidden bg-black">
                    <img ref={thisImgRef} src={currentSlide.image} alt="Img" className="absolute inset-0 w-full h-full object-cover" style={{ transform: "translate(0%, 0%)" }} />
                    <img ref={nextImgRef} alt="Img" className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 flex w-full h-full z-50">
                    <div className="flex-1 h-full lg:cursor-prev-white" onClick={() => { changeSlide(-1) }}></div>
                    <div className="flex-1 h-full lg:cursor-next-white" onClick={() => { changeSlide(1) }}></div>
                </div>
            </div>
        </section>
        </AnimatedSection>
    )
}