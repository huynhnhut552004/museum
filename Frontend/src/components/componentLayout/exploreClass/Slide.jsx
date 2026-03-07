import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AnimatedSection from "../../comon/Animation/AnimatedSection";
import AnimatedTitle from "../../comon/Animation/AnimatedTitle";

export default function Slide({ items }) {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const checkScroll = () => {
        const container = scrollRef.current;
        if (!container) return;
        const { scrollLeft, scrollWidth, clientWidth } = container;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    };
    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, []);

    const scroll = (direction) => {
        const container = scrollRef.current;
        if (!container) return;
        const items = Array.from(container.children);
        const currentScroll = container.scrollLeft;
        const buffer = 20;
        let targetScroll = 0;
        if (direction === 'left') {
            const prevItem = [...items].reverse().find(item => item.offsetLeft < currentScroll - buffer);
            targetScroll = prevItem ? prevItem.offsetLeft : 0;
        } else {
            const nextItem = items.find(item => item.offsetLeft > currentScroll + buffer);
            targetScroll = nextItem ? nextItem.offsetLeft : container.scrollWidth;
        }
        container.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    };

    return (
        <AnimatedSection className="max-w-6xl mx-auto pb-10 lg:space-y-6 space-y-4">
            <AnimatedTitle className="Style-Heading2 text-center">
                Khám phá các tác phẩm Phục Hưng.
            </AnimatedTitle>
            <AnimatedTitle className="relative group">
                <div ref={scrollRef} onScroll={checkScroll} className="flex lg:gap-8 gap-2 items-start overflow-x-auto snap-x scroll-smooth no-scrollbar snap-mandatory py-4">
                    {items.map(item => (
                        <Link to={item.link} key={item.id} className="snap-start shrink-0 flex flex-col gap-2">
                            <div className="lg:h-[50vh] h-[30vh]">
                                <img src={item.img} alt="Img" draggable={false} className="h-full w-auto max-w-none object-contain rounded shadow-sm" />
                            </div>
                            <div className="w-min min-w-[200px]">
                                <div className="Style-Heading2 lg:text-3xl truncate text-center lg:text-left">{item.title}</div>
                                <div className="Style-Text1 text-base text-center lg:text-left">{item.desc}</div>
                            </div>
                        </Link>
                    ))}
                </div>
                {canScrollLeft && (
                    <button onClick={() => scroll('left')} className="absolute hidden lg:flex items-center justify-center left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl bg-white shadow-lg rounded-full w-12 h-12 z-10 hover:bg-gray-100 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                        <img src="/User/icon/ArrowLeftBlack.png" className="w-6 h-6" alt="Prev" />
                    </button>
                )}
                {canScrollRight && (
                    <button onClick={() => scroll('right')} className="absolute hidden lg:flex items-center justify-center right-0 top-1/2 translate-x-1/2 -translate-y-1/2 text-4xl bg-white shadow-lg rounded-full w-12 h-12 z-10 hover:bg-gray-100 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                        <img src="/User/icon/ArrowRightBlack.png" className="w-6 h-6" alt="Next" />
                    </button>
                )}
            </AnimatedTitle>
        </AnimatedSection>
    );
}