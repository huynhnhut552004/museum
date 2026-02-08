import { Link } from "react-router-dom";
import AnimatedSection from "../../Animation/AnimatedSection";
import AnimatedTitle from "../../Animation/AnimatedTitle";

export default function ExploreStory({link, title, desc, img}) {
    return (
        <AnimatedSection>
        <section className="lg:h-[100vh] h-[60vh] relative pb-10 group">
            <AnimatedTitle className="w-full h-full relative ">
                <img src={img} alt="img" className="w-full h-full object-cover" />
                <Link to={link} className="absolute flex items-center justify-center inset-0 w-full h-full">
                    <div className=" w-[90vw] lg:h-[80vh] h-[50vh] rounded-xl bg-gray-800/90 z-1 lg:hover:cursor-arrow-right-white">
                        <div className="flex flex-col gap-4 h-full w-full justify-around items-center lg:p-0 p-2">
                            <div className=" Style-Heading2 text-white lg:text-left text-center">{title}</div>
                            <div className=" Style-Text1 text-white max-w-4xl">{desc}</div>
                            <div className=" Style-Text1 text-white underline">
                                Khám phá →
                            </div>
                        </div>
                    </div>
                </Link>
            </AnimatedTitle>
        </section>
        </AnimatedSection>
    )
}