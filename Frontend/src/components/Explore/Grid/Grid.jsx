import {Link} from "react-router-dom";
import AnimatedSection from "../../Animation/AnimatedSection";
import AnimatedTitle from "../../Animation/AnimatedTitle";

export default function ExploreGrid({card}){
    return(
        <AnimatedSection>
        <section className="max-w-6xl mx-auto pb-10 space-y-6 lg:block hidden">
            <AnimatedTitle className="Style-Heading2 text-center">{card.title}</AnimatedTitle>
            <AnimatedTitle className="grid grid-cols-3 gap-4 grid-rows-2 h-[70vh]">
                  <Link to={card.card1st.link} className="group relative row-span-2 rounded-xl overflow-hidden cursor-pointer">
                    <img src={card.card1st.img} alt="Img" draggable={false} className="w-full h-full object-cover"/>
                    <div className="Style-Text1 p-0 text-center rounded-xl absolute text-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:backdrop-blur-sm bg-black/20 opacity-0 transition-all duration-300 ease-out group-hover:opacity-100 flex items-center justify-center">{card.card1st.title}</div>
                </Link>  
                {card.cards.map(item=>(
                    <Link key={item.id} to={item.link} className="group relative overflow-hidden rounded-xl cursor-pointer">
                    <img src={item.img} alt="Img" draggable={false} className="w-full h-full object-cover"/>
                    <div className="Style-Text1 p-0 text-center rounded-xl absolute text-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-sm bg-black/20 opacity-0 transition-all duration-300 ease-out group-hover:opacity-100 flex items-center justify-center">{item.title}</div>
                </Link>
                ))}
            </AnimatedTitle>
        </section>
        <section className="max-w-6xl mx-auto pb-10 lg:space-y-6 space-y-4 lg:hidden">
            <AnimatedTitle className="Style-Heading2 text-center">{card.title}</AnimatedTitle>
            <AnimatedTitle className="gap-2 flex flex-col">
                  <Link to={card.card1st.link} className="relative flex-auto rounded-xl overflow-hidden">
                    <img src={card.card1st.img} alt="Img" draggable={false} className="w-full h-full object-cover"/>
                    <div className="Style-Text1 p-2 text-center rounded-xl absolute text-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/20 flex items-center justify-center">{card.card1st.title}</div>
                </Link>  
                {card.cards.map(item=>(
                    <Link key={item.id} to={item.link} className="relative flex-auto overflow-hidden rounded-xl">
                    <img src={item.img} alt="Img" draggable={false} className="w-full h-full object-cover"/>
                    <div className="Style-Text1 p-2 text-center rounded-xl absolute text-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:backdrop-blur-sm bg-black/20 flex items-center justify-center">{item.title}</div>
                </Link>
                ))}
            </AnimatedTitle>
        </section>
        </AnimatedSection>
        
    )
}