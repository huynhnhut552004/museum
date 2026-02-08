import ExploreCard from "./ExploreCard";
import AnimatedSection from "../../Animation/AnimatedSection";
import AnimatedTitle from "../../Animation/AnimatedTitle";

export default function ExploreBytheme({items}) {
    return (
        <AnimatedSection>
        <section className="max-w-6xl mx-auto pb-10 lg:space-y-6 space-y-4">
                <AnimatedTitle className="Style-Heading2 text-center">
                    Bạn muốn khám phá điều gì?
                </AnimatedTitle>
                <AnimatedTitle className="flex lg:flex-row flex-col gap-4 pt-4">
                    {items.map(item => (
                        <ExploreCard
                            key={item.key}
                            title={item.title}
                            img={item.img}
                            link={item.link}
                        />
                    ))}
                </AnimatedTitle>
        </section>
        </AnimatedSection>
    )
}