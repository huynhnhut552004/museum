import Card from "./Card";
import { useState } from "react";
import AnimatedSection from "../../../comon/Animation/AnimatedSection";
import AnimatedTitle from "../../../comon/Animation/AnimatedTitle";

export default function Tradition({ items }) {
    const [activeIndex, setActiveIndex] = useState(2);
    return (
        <AnimatedSection className="max-w-6xl mx-auto pb-10 lg:space-y-6 space-y-4">
            <AnimatedTitle className="Style-Heading2 text-center">Khám phá nghệ thuật truyền thống Châu Á.</AnimatedTitle>
            <div className="flex justify-center lg:h-[60vh] h-[30vh] items-center overflow-hidden">
                <AnimatedTitle className="flex items-center justify-center">
                    {items.map((item, index) => (
                        <Card
                            key={item.id}
                            item={item}
                            index={index}
                            activeIndex={activeIndex}
                            onHover={setActiveIndex}
                        />
                    ))}
                </AnimatedTitle>
            </div>
        </AnimatedSection>
    )
}