import AnimatedSection from "../../comon/Animation/AnimatedSection";
import AnimatedTitle from "../../comon/Animation/AnimatedTitle";
import { Link } from 'react-router-dom';

export default function Theme({ items, hero }) {
    return (
        <AnimatedSection className="max-w-6xl mx-auto pb-10 lg:space-y-6 space-y-4">
            <AnimatedTitle className="Style-Heading2 text-center">{hero}</AnimatedTitle>
            <AnimatedTitle className="flex lg:flex-row flex-col gap-4 pt-4">
                {items.map(item => (
                    <Link to={item.link} state={item.linkState} className="flex-1 relative bg-gray-800 overflow-hidden group">
                        <div className="overflow-hidden">
                            <img src={item.img} alt="Img" draggable={false} className="w-full lg:h-[60vh] h-[20vh] object-cover opacity-60 transform transition-all ease-in-out cursor-pointer duration-300 lg:group-hover:scale-125" />
                        </div>
                        <div className="flex flex-col justify-around items-center absolute inset-0 pointer-events-none">
                            <div className="Style-Text1 text-white underline">{item.heading}</div>
                            <div className="Style-Text1 text-white uppercase text-center">{item.title}</div>
                            <div className="Style-Text1 text-white border p-2">{item.end}</div>
                        </div>
                    </Link>
                ))}
            </AnimatedTitle>
        </AnimatedSection>
    )
}