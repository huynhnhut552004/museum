import { useEffect, useState } from "react";
import AnimatedSection from "../../Animation/AnimatedSection";
import AnimatedTitle from "../../Animation/AnimatedTitle";

export default function Nation({items, defaultImg}) {
    const [Img, setImg] = useState(defaultImg);
    const [mobile, setMobile]= useState(false);
    useEffect (()=>{
        const handleResize = () => {
            setMobile(window.innerWidth < 1024);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return (
        <AnimatedSection>
            <section className="pb-10">
                <AnimatedTitle>
                <div className="relative w-full lg:h-[80vh] h-[30vh]">
                    <img src={Img} alt="Img" className="w-full h-full object-cover transition-all duration-500 ease-in-out" />
                    <div className="bg-black/40 w-full h-full absolute inset-0" />
                    <div className="flex absolute inset-0 w-full h-full">
                        {items.map((item, index) => (
                            <div key={index} className="flex-1 h-full border-r border-white/30 transition-all duration-300 ease-out hover:bg-white/10" onMouseEnter={!mobile ? () => setImg(item.img): undefined} onMouseLeave={!mobile ? () => setImg(defaultImg): undefined} onClick={mobile ? ()=> setImg(item.img): undefined} />
                        ))}
                    </div>
                    <div className="flex absolute inset-0 w-full h-full items-center pointer-events-none">
                        {items.map((item, index) => (
                            <div key={index} className="flex-1 text-center Style-Heading2 text-white">
                                {item.title}
                            </div>
                        ))}
                    </div>
                </div>
                </AnimatedTitle>
            </section>
        </AnimatedSection>
    )
}