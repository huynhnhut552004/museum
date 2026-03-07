import { useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FrameSize = (ratio) =>{
    const maxW= window.innerWidth * 0.6;
    const maxH= window.innerHeight * 0.7;
    let targetH, targetW;
    if (maxW/ maxH > ratio){
        targetH = maxH;
        targetW = targetH * ratio;
    } else {
        targetW = maxW;
        targetH= targetW / ratio;
    }
    return {with: targetW, height: targetH};
};

export default function useAnimatedSlide({containerRef, frameRef, bgImgRef, textRef, thisImgRef, nextImgRef, content}){
    const [activeIndex, setActiveIndex]= useState(0);
    const [animating, setAnimating]= useState(false);
    useLayoutEffect(()=>{
        let cxt= gsap.context(()=>{
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: "top top",
                end: "+=300",
                pin: true,
                scrub: false
            });
            gsap.set(nextImgRef.current, {xPercent: 100});
            const initialSize = FrameSize(content[0].ratio);
            gsap.set(frameRef.current, {width: initialSize.with, height: initialSize.height});
        }, containerRef);
        return()=> cxt.revert();
    }, [containerRef, nextImgRef]);

    const changeSlide = (direction) =>{
        if (animating) return;
        let nextIndex = activeIndex + direction;
        if (nextIndex>= content.length) nextIndex=0;
        if (nextIndex<0) nextIndex = content.length-1;
        setAnimating(true);
        const nextSlideContent= content[nextIndex];
        nextImgRef.current.src = nextSlideContent.image;
        const newSize = FrameSize(nextSlideContent.ratio);
        const XOut= direction === 1 ? -100 : 100;
        const XInStart = direction === 1 ? 100 : -100;

        const tl = gsap.timeline({
            onComplete: () => {
                gsap.set(thisImgRef.current, {xPercent: 0});
                gsap.set(nextImgRef.current, {xPercent: 100});
                setAnimating(false);
            }
        });
        tl.set(nextImgRef.current, {xPercent: XInStart})
        .to(frameRef.current, {width: newSize.with, height: newSize.height, duration: 0.8, ease: "power3.inOut"})
        .to(textRef.current, {opacity: 0, y: 10, duration: 0.3})
        .to(bgImgRef.current, {opacity: 0, duration: 0.5}, "<")
        .to(thisImgRef.current, {xPercent: XOut, duration: 0.8, ease: "power3.inOut"}, "<")
        .to(nextImgRef.current, {xPercent: 0, duration: 0.8, ease: "power3.inOut"}, "<")
        .call(()=>{
            setActiveIndex(nextIndex);
        })
        .to({}, {duration: 0.05})
        .to(bgImgRef.current, {opacity: 1, duration: 0.6})
        .to(textRef.current, {opacity: 1, y: 0, duration: 0.4}, "-=0.3");
    };
    return {activeIndex, changeSlide};
}