import AnimatedSection from "../components/Animation/AnimatedSection";

export default function Event(){
    return(
        <AnimatedSection>
            <div className=" max-w-3xl lg:mx-auto lg:space-y-6 space-y-4 pb-10 lg:px-0 px-4">
                <div className="Style-Heading2 text-center lg:text-6xl text-3xl lg:pb-6 pb-4">
                    Theo dõi các sự kiện
                </div>
                <section className="space-y-2">
                    <div className="Style-Text1 text-center">
                        Hiện tại chưa có sự kiện nào...
                    </div>
                </section>
            </div>
       </AnimatedSection>
    )
}