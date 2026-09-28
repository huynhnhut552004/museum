import gsap from "gsap";
import { useLayoutEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Observer } from "gsap/all";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Observer);

export default function useSnapScroll() {
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    let ctx = gsap.context(() => {
      const sections = gsap.utils.toArray(".snap-section");
      if (sections.length === 0) return;
      let currentIndex = 0;
      let isAnimating = false;
      const gotoSection = (index) => {
        if (isAnimating) return;
        if (index < 0 || index >= sections.length) return;
        isAnimating = true;
        currentIndex = index;

        gsap.to(window, {
          scrollTo: { y: index * window.innerHeight, autoKill: false },
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: () => { isAnimating = false; },
          overwrite: true
        });
      };

      Observer.create({
        type: "wheel,touch,pointer",
        wheelSpeed: -1,
        onDown: () => { if (!isAnimating) gotoSection(currentIndex + 1); },
        onUp: () => { if (!isAnimating) gotoSection(currentIndex - 1); },
        tolerance: 10,
        preventDefault: true
      });
    });

    return () => ctx.revert();
  }, []);
}