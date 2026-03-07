import gsap from "gsap";
import { useLayoutEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Observer } from "gsap/all";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Observer);

export default function useSnapScroll() {
  useLayoutEffect(() => {
    // 1. Kiểm tra xem plugin đã load chưa
    if (typeof window === "undefined") return;

    let ctx = gsap.context(() => {
      const sections = gsap.utils.toArray(".snap-section");
      
      // Nếu không tìm thấy section nào thì dừng luôn
      if (sections.length === 0) return;

      let currentIndex = 0;
      let isAnimating = false;

      const gotoSection = (index) => {
        if (isAnimating) return;
        if (index < 0 || index >= sections.length) return;

        isAnimating = true;
        currentIndex = index;

        gsap.to(window, {
          // Cuộn đến vị trí top của section đích
          scrollTo: { y: index * window.innerHeight, autoKill: false },
          duration: 0.8, 
          ease: "power2.inOut",
          onComplete: () => {
            isAnimating = false;
          },
          overwrite: true // Đè lên các lệnh cuộn khác nếu có
        });
      };

      Observer.create({
        type: "wheel,touch,pointer",
        wheelSpeed: -1,
        onDown: () => {
          if (!isAnimating) gotoSection(currentIndex + 1);
        },
        onUp: () => {
          if (!isAnimating) gotoSection(currentIndex - 1);
        },
        tolerance: 10,
        preventDefault: true // Chặn hành vi cuộn tay của trình duyệt
      });
      
      // Reset về đầu trang khi F5 để tránh lỗi vị trí
      // window.scrollTo(0, 0); 
    });

    return () => ctx.revert();
  }, []);
}