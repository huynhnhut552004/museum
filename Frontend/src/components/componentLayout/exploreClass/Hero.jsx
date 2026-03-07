import { Link } from "react-router-dom";
import AnimatedSection from "../../comon/Animation/AnimatedSection";
import AnimatedTitle from "../../comon/Animation/AnimatedTitle";

export default function Hero({ imgL, imgR, title1, title2, linkL, linkR }) {
    return (
        <AnimatedSection className="relative -mt-4 lg:h-auto h-[40vh] bg-gray-800 mb-10">
            <div className="flex w-full h-full">
                <Link to={linkL} className="overflow-hidden flex-1 w-full h-full">
                    <img src={imgL} alt="Img" draggable={false} className="transform transition-all object-cover lg:hover:cursor-arrow-right-white duration-300 lg:hover:scale-125 opacity-40 lg:w-full lg:h-auto h-full w-auto" />
                </Link>
                <Link to={linkR} className="overflow-hidden flex-1 w-full h-full">
                    <img src={imgR} alt="Img" draggable={false} className="transform transition-all object-cover lg:hover:cursor-arrow-right-white duration-300 lg:hover:scale-125 opacity-40 lg:w-full lg:h-auto h-full w-auto" />
                </Link>
            </div>
            <div className="flex absolute inset-0 pointer-events-none">
                <AnimatedTitle className="Style-Text1 flex-1 text-white lg:text-3xl flex items-center justify-center">{title1}</AnimatedTitle>
                <AnimatedTitle className="Style-Text1 w-[50%] text-white lg:text-3xl flex items-center justify-center">{title2}</AnimatedTitle>
            </div>
        </AnimatedSection>
    )
}

