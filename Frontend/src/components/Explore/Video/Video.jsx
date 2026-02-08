import {Link} from "react-router-dom";
import AnimatedSection from "../../Animation/AnimatedSection";
import AnimatedTitle from "../../Animation/AnimatedTitle";

export default function Video({video, title, link}){
    return (
        <AnimatedSection>
        <section className="pb-10 mb-10 lg:h-[100vh] h-[40vh] lg:w-[100vw] bg-[#B2B2B2] relative group lg:hover:cursor-arrow-right-white">
            <AnimatedTitle className="Style-Heading2 bg-opacity-0 text-black absolute inset-0 flex justify-center lg:pt-10 pt-2">{title}</AnimatedTitle>
            <Link to={link} className="w-full h-full flex items-end justify-center">
            <AnimatedTitle className="lg:w-[80vw] w-[90vw] h-[30vh] lg:h-[80vh] lg:hover:cursor-arrow-right-white">
                <video className="Style-Video rounded-xl opacity-100 w-full h-full" autoPlay loop muted playsInline>
                    <source src={video} type="video/mp4"/>
                </video>
            </AnimatedTitle>
            </Link>
        </section>
        </AnimatedSection>
    )
}