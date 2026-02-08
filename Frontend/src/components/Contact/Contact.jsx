import AnimatedSection from "../Animation/AnimatedSection";
import AnimatedText from "../Animation/AnimatedText";
import AnimatedTitle from "../Animation/AnimatedTitle";

export default function Contact({ thanks, title1, title2, hot, fdback, style }) {
    return (
        <div className="min-h-screen">
            <AnimatedSection>
                <div className="max-w-6xl lg:mx-auto lg:pb-10 pb-6 px-4">
                    <AnimatedTitle>
                        <div className={`${style.heading} lg:text-6xl text-3xl text-center lg:pb-6 pb-4`}>{thanks}</div>
                    </AnimatedTitle>
                    <AnimatedTitle>
                        <div className= {`${style.heading} lg:pb-4 pb-2`}>{title1}</div>
                    </AnimatedTitle>
                    <div className="space-y-2">
                        {hot.map((item, index) => (
                            <AnimatedText key={index}>
                                <div className={`${style.text}`}>{item}</div>
                            </AnimatedText>
                        ))}
                    </div>
                </div>
            </AnimatedSection>
            <div className="border-t lg:pt-10 pt-6 border-gray-400 px-4 lg:px-0 mb-10">
                <AnimatedSection>
                    <div className="max-w-6xl mx-auto">
                        <AnimatedTitle>
                            <div className={`${style.heading}`}>{title2}</div>
                        </AnimatedTitle>
                        <AnimatedText>
                            <form className="border border-gray-400 lg:p-6 p-4 Shadow lg:mt-10 mt-6" >
                                <div className="space-y-2">
                                    <input type="text" placeholder="Tên" className={`${style.input}`} />
                                    <input type="text" placeholder="Email" className={`${style.input}`} />
                                    <input type="text" placeholder="Mục đích liên hệ" className={`${style.input}`}/>
                                    <input type="text" placeholder="Nội dung" className={`${style.input}`} />
                                </div>
                                <button type="submit" className={`font-josefin ${style.button} text-xl lg:text-lg p-2 lg:mt-16 mt-8 underline lg:no-underline lg:hover:underline duration-300 ease-in-out`}>Gửi→</button>
                            </form>
                        </AnimatedText>
                        <AnimatedText>
                            <div className="Style-Text1 lg:pt-6 pt-4">{fdback}</div>
                        </AnimatedText>
                    </div>
                </AnimatedSection>
            </div>
        </div>
    )
}