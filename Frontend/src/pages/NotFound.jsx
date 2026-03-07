import AnimatedSection from "../components/comon/Animation/AnimatedSection";
import AnimatedText from "../components/comon/Animation/AnimatedText";
import AnimatedTitle from "../components/comon/Animation/AnimatedTitle";
import PageTransition from "../components/comon/Animation/AnimatedPage";
import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <PageTransition>
            <AnimatedSection className="relative bg-gray-50 h-screen overflow-hidden select-none">
                <div className="bg-gray-200 border border-black rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:p-[18%] p-[50%] shadow-sm" />
                <div className="absolute flex flex-col items-center justify-center inset-0 gap-10">
                    <AnimatedTitle className="flex flex-col items-center justify-center gap-2">
                        <div className="lg:text-8xl text-5xl font-bold Digital-Heading text-black">
                            404
                        </div>
                        <div className="lg:text-7xl text-5xl font-bold Digital-Heading text-black">
                            Not Found
                        </div>
                    </AnimatedTitle>
                    <AnimatedText className="flex flex-col items-center justify-center">
                        <div className="Digital-Text1 text-gray-600 text-base">
                            Nothing here!
                        </div>
                        <div className="Digital-Text1 text-gray-600 text-base">
                            Something's Wrong, please go back.
                        </div>
                    </AnimatedText>
                    <AnimatedText className="border-[2px] border-gray-500 lg:hover:bg-gray-50 rounded-3xl lg:hover:shadow-md lg:hover:shadow-slate-600 py-2 px-[2%] lg:hover:cursor-pointer lg:transition-all lg:duration-300 lg:ease-out">
                        <Link to="/" className="Digital-Text1 text-gray-600 text-base">Go back?</Link>
                    </AnimatedText>
                </div>
                <img src="/User/img/Not_Found1.png" draggable={false} alt="Img" className="absolute lg:w-[50vw] mix-blend-multiply lg:-left-[7%] -left-[20%]" />
                <img src="/User/img/Not_Found2.png" draggable={false} alt="Img" className="absolute lg:w-[50vw] mix-blend-multiply lg:top-[50%] top-[73%] lg:left-[55%] left-[20%]" />
            </AnimatedSection>
        </PageTransition>
    )
};