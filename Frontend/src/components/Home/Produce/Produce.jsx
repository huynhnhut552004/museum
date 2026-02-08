import { Link } from "react-router-dom";
import AnimatedMedia from "../../Animation/AnimatedMedia";
import AnimatedSection from "../../Animation/AnimatedSection";
import AnimatedTitle from "../../Animation/AnimatedTitle";
import AnimatedText from "../../Animation/AnimatedText";

export default function Produce({ title, by, desc, img, nav }) {
    return (
        <AnimatedSection>
            <section className="max-w-6xl mx-auto pb-10 lg:space-y-6 space-y-4">
                <AnimatedTitle>
                    <div className="Style-Heading2 text-center">{title}</div>
                </AnimatedTitle>
                <div className="relative w-full full">
                    <AnimatedMedia direction="left">
                        <img src={img} alt="Img" className="w-full h-full object-cover" />
                        <div className="bg-black/40 w-full h-full absolute inset-0" />
                    </AnimatedMedia>
                    <AnimatedText>
                        <div className="Style-Text1 text-white absolute bottom-1 left-1 lg:bottom-[90%] lg:left-6 backdrop-blur-sm p-2 rounded-xl">{by}</div>
                    </AnimatedText>
                    <AnimatedText>
                        <div className="max-w-2xl hidden lg:block Style-Text1 text-white absolute backdrop-blur-sm left-6 bottom-6 p-2 rounded-r-xl border-l-[2px] ">{desc}</div>
                    </AnimatedText>
                    <AnimatedText>
                        <Link to="/explore" className="Style-Nav hidden lg:inline-block text-white backdrop-blur-sm absolute right-6 bottom-6 transition-all transform duration-300 ease-in-out hover:underline p-4 border border-white/20 hover:border-white/40">{nav}</Link>
                    </AnimatedText>
                </div>
                <AnimatedText>
                        <div className=" Style-Text1 lg:hidden">{desc}</div>
                    </AnimatedText>
                    <AnimatedText>
                        <Link to="/explore" className="Style-Nav lg:hidden border border-gray-800 p-4">{nav}</Link>
                    </AnimatedText>
            </section>
        </AnimatedSection>
    )
}