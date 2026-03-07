import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function usescrolltrigger({ text1Ref, text2Ref, text3Ref, textEnd, pbarRef, imgRef, containerRef, config }) {
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            if (!containerRef.current) return;
            const { img, timing, scroll } = config;
            gsap.set(imgRef.current, { scale: 2, xPercent: 0, yPercent: 0 });
            gsap.set(pbarRef.current, { scaleX: 0 });
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: `+=${scroll.length}`,
                    pin: true,
                    scrub: scroll.scrub,
                    onUpdate: (self) => {
                        gsap.set(pbarRef.current, {
                            scaleX: self.progress,
                        });
                    },
                },
            });
            tl.to(imgRef.current, {
                xPercent: img.move1X,
                yPercent: img.move1Y,
                scale: img.Zoom1,
                duration: timing.time1,
                ease: "power2.inOut"
            })
                .to(text1Ref.current, { opacity: 1, y: 0 }, "<+=0.5");

            tl.to(text1Ref.current, { opacity: 0, y: -20 })
                .to(imgRef.current, {
                    xPercent: img.move2X,
                    yPercent: img.move2Y,
                    scale: img.zoom2,
                    duration: timing.time2,
                    ease: "power2.inOut"
                }, "<")
                .to(text2Ref.current, { opacity: 1, y: 0 }, "-=1.5");

            tl.to(text2Ref.current, { opacity: 0, y: -20 })
                .to(imgRef.current, {
                    xPercent: img.move3X,
                    yPercent: img.move3Y,
                    scale: img.zoom3,
                    duration: timing.time3,
                    ease: "power2.inOut"
                }, "<")
                .to(text3Ref.current, { opacity: 1, y: 0 }, "-=1");

            tl.to(text3Ref.current, { opacity: 0})
                .to(imgRef.current, {
                    scale: img.zoomend,
                    xPercent: 0,
                    yPercent: 0,
                    duration: timing.end,
                    ease: "power2.inOut"
                },"<")
                .to(textEnd.current, {opacity: 1, y: 0});
        }, containerRef);
        return () => ctx.revert();
    }, [config]);
};