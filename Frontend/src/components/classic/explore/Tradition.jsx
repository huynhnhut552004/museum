import { useState } from "react";
import { Link } from "react-router-dom";
import AnimatedSection from "../../comon/Animation/AnimatedSection";
import AnimatedTitle from "../../comon/Animation/AnimatedTitle";

export default function Tradition({ hero, items = [] }) {
    const [activeIndex, setActiveIndex] = useState(2);
    return (
        <AnimatedSection className="max-w-6xl mx-auto pb-10 lg:space-y-6 space-y-4">
            <AnimatedTitle className="Style-Heading2 text-center">{hero}</AnimatedTitle>
            <div className="flex justify-center lg:h-[60vh] h-[30vh] items-center overflow-hidden">
                <AnimatedTitle className="flex items-center justify-center">
                    {items.map((item, index) => {
                        const calculateStyle = () => {
                            const distance = Math.abs(index - activeIndex);
                            if (distance === 0) {
                                return {
                                    zIndex: 30,
                                    classes: "scale-110 opacity-100 brightness-100",
                                };
                            }
                            if (distance === 1) {
                                return {
                                    zIndex: 20,
                                    classes: "scale-90",
                                };
                            }
                            return {
                                zIndex: 10,
                                classes: "scale-75",
                            };
                        };
                        const styleConfig = calculateStyle();
                        const handleClick = (e) => {
                            if (index !== activeIndex) {
                                e.preventDefault();
                                setActiveIndex(index);
                            }
                        };
                        return (
                            <Link to={item.link} state={item.linkState} onClick={handleClick} onMouseEnter={() => setActiveIndex(index)} className={`relative lg:w-64 lg:h-96 w-32 h-52 rounded-2xl shadow-xl cursor-pointer overflow-hidden transition-all duration-500 ease-in-out -ml-16 first:ml-0 ${styleConfig.classes}`} style={{ zIndex: styleConfig.zIndex }}>
                                <img src={item.img} alt="Img" draggable={false} className="absolute inset-0 w-full h-full object-cover" />
                                <div className={`absolute inset-0 bg-gray-800/80 to-transparent opacity-40`} />
                                <div className="absolute bottom-0 left-0 p-6">
                                    <div className="Style-Text1 text-white">{item.title}</div>
                                </div>
                            </Link>
                        )
                    })}
                </AnimatedTitle>
            </div>
        </AnimatedSection>
    )
}