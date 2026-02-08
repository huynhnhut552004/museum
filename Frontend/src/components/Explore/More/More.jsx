import { Link } from "react-router-dom";
import AnimatedSection from "../../Animation/AnimatedSection";
import AnimatedTitle from "../../Animation/AnimatedTitle";

export default function More({img, title, desc, link}) {
    return (
        <AnimatedSection>
        <section className="max-w-6xl mx-auto pb-10 lg:space-y-6 space-y-4">
                <AnimatedTitle className="relative h-[30vh] lg:h-[50vh]">
                    <img src={img} alt="Img" draggable={false} className="w-full h-full object-cover lg:rounded-xl" />
                    <div className="absolute lg:rounded-xl inset-0 w-full h-full bg-black/40">
                        <div className="flex flex-col justify-center items-center w-full h-full gap-4 ">
                            <div className="Style-Heading2 text-white">{title}</div>
                            <div className="Style-Text1 text-white">{desc}</div>
                            <Link to={link} className="Style-Text1 text-white border px-6 py-1 lg:hover:bg-gray-300 transition-all duration-300 ease-out">Khám phá thêm</Link>
                        </div>
                    </div>
                </AnimatedTitle>
        </section>
        </AnimatedSection>
    )
}