import { useRef } from "react";
import usescrolltrigger from "../../Animation/ScrollTrigger";
import AnimatedSection from "../../Animation/AnimatedSection";

export default function Scroll({ img, desc1, desc2, desc3, desc4 }) {
    const ContainerRef = useRef(null);
    const imgRef = useRef(null);
    const pbarRef = useRef(null);
    const text1Ref = useRef(null);
    const text2Ref = useRef(null);
    const text3Ref = useRef(null);
    const textEnd = useRef(null);
    const ANIMATION_CONFIG = {
        img: {
            move1X: -35,
            move1Y: 60,
            zoom1: 2,
            move2X: 10,
            move2Y: -20,
            zoom2: 1.5,
            move3X: -38,
            move3Y: -50,
            zoom3: 2,
            zoomend: 1,
        },
        timing: {
            time1: 3,
            time2: 5,
            time3: 5,
            end: 7
        },
        scroll: {
            length: 4000,
            scrub: 1
        }
    };
    usescrolltrigger({
        text1Ref,
        text2Ref,
        text3Ref,
        textEnd,
        pbarRef,
        imgRef,
        containerRef: ContainerRef,
        config: ANIMATION_CONFIG
    });
    return (
        <AnimatedSection>
            <section ref={ContainerRef} className="relative mb-10 scroll-section bg-black w-full h-screen overflow-hidden flex items-center justify-center">
                <div className="absolute top-[10%] left-0 z-10 rounded-full overflow-hidden bg-none w-full h-1">
                    <div ref={pbarRef} className="bg-white progress-bar rounded-full origin-left w-full h-full" />
                </div>

                <div className="absolute inset-0 mx-auto my-auto lg:w-[80vw] w-full lg:h-full h-[40vh] z-0">
                    <img ref={imgRef} src={img} alt="Img" className="w-full h-full max-w-none object-cover origin-center will-change-transform" />
                </div>
                <div className="absolute inset-0 w-full h-full bg-black/10" />
                <div ref={text1Ref} className="absolute lg:bottom-[20%] lg:right-[40%] bottom-[5%] right-[10%] lg:translate-x-1/2 lg:translate-y-1/2 lg:max-w-xl max-w-xs opacity-0 border-r-[4px] lg:backdrop-blur-md bg-black/60 p-6 rounded-xl">
                    <div className="Style-Heading2 text-white">{desc1.title}</div>
                    <div className="Style-Text1 text-white">{desc1.desc}</div>
                </div>
                <div ref={text2Ref} className="absolute lg:bottom-[20%] lg:left-[35%] bottom-[55%] left-[13%] lg:translate-x-1/2 lg:translate-y-1/2 lg:max-w-xl max-w-xs opacity-0 border-r-[4px] lg:backdrop-blur-md bg-black/60 p-6 rounded-xl">
                    <div className="Style-Heading2 text-white">{desc2.title}</div>
                    <div className="Style-Text1 text-white">{desc2.desc}</div>
                </div>
                <div ref={text3Ref} className="absolute lg:bottom-[50%] lg:right-[30%] bottom-[55%] right-[5%] lg:translate-x-1/2 lg:translate-y-1/2 lg:max-w-xl max-w-xs opacity-0 border-r-[4px] bg-black/60 p-6 lg:backdrop-blur-md rounded-xl">
                    <div className="Style-Heading2 text-white">{desc3.title}</div>
                    <div className="Style-Text1 text-white">{desc3.desc}</div>
                </div>
                <div ref={textEnd} className="absolute lg:bottom-[10%] lg:left-[10%] bottom-[10%] left-[2%] lg:translate-x-1/2 lg:translate-y-1/2 bg-black/40 p-6 opacity-0 rounded-xl">
                    <div className="Style-Heading2 text-white">{desc4.title}</div>
                    <div className="Style-Text1 text-white">{desc4.desc}</div>
                </div>
            </section>
        </AnimatedSection>
    )
}