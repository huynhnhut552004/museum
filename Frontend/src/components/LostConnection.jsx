import PageTransition from "./comon/Animation/AnimatedPage";
import AnimatedSection from "./comon/Animation/AnimatedSection";
import AnimatedTitle from "./comon/Animation/AnimatedTitle";
import AnimatedText from "./comon/Animation/AnimatedText";

export default function LostConnection({ click, lang }) {
    return (
        <PageTransition>
            <AnimatedSection className="lg:p-0 p-4 fixed inset-0 z-[9999] bg-gray-50 flex flex-col items-center justify-center gap-4">
                <AnimatedTitle className="w-fit h-[30%] mb-6">
                    <img src="/User/img/LostConnection.png" alt="Img" className="w-full h-full object-contain" />
                </AnimatedTitle>
                <AnimatedTitle className="text-black font-inter lg:text-4xl text-2xl text-center">
                    {lang === "vi" ? "Có gì đó không đúng!" : "Something's not right!"}
                </AnimatedTitle>
                <AnimatedText className="text-black font-inter lg:text-xl text-base text-center">
                    {lang === "vi" ? "Đã có lỗi xảy ra, vui lòng kiểm tra và thử lại sau." : "An error occurred, please check and try again later."}
                </AnimatedText>
                <AnimatedText>
                    <button onClick={click} className="text-black font-inter text-xl lg:bg-gray-300 bg-inherit p-2 rounded-full border-black border-[2px] lg:hover:scale-[1.02] lg:hover:-translate-y-[2px] lg:hover:shadow-lg lg:hover:bg-gray-50 lg:hover:shadow-slate-600">{lang === "vi" ? "Thử lại" : "try again"}</button>
                </AnimatedText>
            </AnimatedSection>
        </PageTransition>
    )
}