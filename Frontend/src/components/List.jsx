import AnimatedSection from "./comon/Animation/AnimatedSection";
import AnimatedTitle from "./comon/Animation/AnimatedTitle";
import AnimatedText from "./comon/Animation/AnimatedText";
import { Link } from "react-router-dom";

export default function ListLayout({ items, total, title, style, lang }) {
    return (
        <AnimatedSection className="max-w-6xl mx-auto pb-10">
            <AnimatedTitle className="h-[10vh] mb-4 border-b border-gray-400">
                <AnimatedText className={`${style?.heading} text-center`}>{title}</AnimatedText>
                <AnimatedText className={`${style?.text}`}>{total} {lang == "vi" ? "Kết quả" : "Result"}</AnimatedText>
            </AnimatedTitle>
            <AnimatedTitle className="">
                <AnimatedText className=" overflow-x-hidden overflow-y-auto relative">
                    <div className=" columns-2 md:columns-3 lg:columns-4 gap-2">
                        {items?.map((item) => (
                            <Link key={item.id} to={item.linkUrl}>
                                <div className="relative mb-2 break-inside-avoid" title={item.title}>
                                    <img src={item.media_url} alt="Img" className="w-full h-auto block rounded-sm" />
                                    <div className="absolute inset-0 pointer-events-none bg-black/20 rounded-sm" />
                                    <div className="absolute Style-Text1 font-bold bottom-2 left-2 text-white drop-shadow-md">
                                        {item.title}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </AnimatedText>
            </AnimatedTitle>
        </AnimatedSection>
    )
}