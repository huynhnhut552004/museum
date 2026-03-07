import Card from "./Card";
import AnimatedSection from "../../../comon/Animation/AnimatedSection";
import AnimatedTitle from "../../../comon/Animation/AnimatedTitle";

export default function Theme({ items }) {
    return (
        <AnimatedSection className="max-w-6xl mx-auto pb-10 lg:space-y-6 space-y-4">
            <AnimatedTitle className="Style-Heading2 text-center">
                Bạn muốn khám phá điều gì?
            </AnimatedTitle>
            <AnimatedTitle className="flex lg:flex-row flex-col gap-4 pt-4">
                {items.map(item => (
                    <Card
                        key={item.key}
                        title={item.title}
                        img={item.img}
                        link={item.link}
                    />
                ))}
            </AnimatedTitle>
        </AnimatedSection>
    )
}