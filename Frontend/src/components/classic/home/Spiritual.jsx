import AnimatedMedia from "../../comon/Animation/AnimatedMedia";
import AnimatedSection from "../../comon/Animation/AnimatedSection";
import AnimatedText from "../../comon/Animation/AnimatedText";
import AnimatedTitle from "../../comon/Animation/AnimatedTitle";
import { Link } from "react-router-dom";

export default function Spiritual({ img, title, desc, nav }) {
    return (
        <AnimatedSection className="max-w-6xl mx-auto pb-10 lg:space-y-6 space-y-4">
            <AnimatedTitle className="Style-Heading2 lg:hidden">{title}</AnimatedTitle>
            <div className="flex lg:h-[90vh] lg:gap-6 gap-2 items-center justify-center">
                <div className="lg:w-[40%] w-[50%] relative">
                    <AnimatedMedia direction="right">
                        <img src={img} alt="Img" className="w-full h-full shadow-xl rounded-xl" />
                        <div className="bg-black/20 absolute inset-0 rounded-xl" />
                    </AnimatedMedia>
                </div>
                <div className="flex-1 h-full flex flex-col justify-around ">
                    <AnimatedTitle className="Style-Heading2 flex-1 hidden lg:block">{title}</AnimatedTitle>
                    <AnimatedText className="Style-Text1 flex-1">{desc}</AnimatedText>
                    <AnimatedText>
                        <Link to="/explore" className="Style-Nav hidden lg:inline-block flex-1 transition-all transform duration-300 ease-in-out hover:underline p-4 border border-[#1e3d58]">{nav}</Link>
                    </AnimatedText>
                </div>
            </div>
            <AnimatedText>
                <Link to="/explore" className="Style-Nav lg:hidden transition-all transform duration-300 ease-in-out lg:hover:underline p-4 border border-[#1e3d58]">{nav}</Link>
            </AnimatedText>
        </AnimatedSection>
    )
}

