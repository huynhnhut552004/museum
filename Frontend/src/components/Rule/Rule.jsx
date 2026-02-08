import AnimatedSection from "../Animation/AnimatedSection";
import AnimatedTitle from "../Animation/AnimatedTitle";
import AnimatedText from "../Animation/AnimatedText";

export default function RuleLayout({ items, style }) {
    return (
        <div>
            <div className="max-w-3xl lg:mx-auto lg:space-y-6 space-y-4 pb-10 lg:px-0 px-4">
                {items.map(item => (
                    <AnimatedSection key={item.id}>
                        <section>
                            <AnimatedTitle>
                                <div className={`${style.heading} lg:text-5xl text-3xl lg:pb-6 pb-4`}>{item.title}</div>
                            </AnimatedTitle>
                            {item.para.map((text, index) => (
                                <AnimatedText key={index}>
                                    <div className={`${style.text}`}>{text}</div>
                                </AnimatedText>
                            ))}
                        </section>
                    </AnimatedSection>
                ))}
            </div>
            <AnimatedSection>
                <section>
                    <div className="lg:pt-10 pt-6 border-t border-gray-400 mb-10" >
                        <div className="max-w-3xl lg:px-0 px-4 lg:mx-auto" >
                            <AnimatedTitle className={`${style.heading}`} >
                                Email liên hệ
                            </AnimatedTitle>
                            <AnimatedText>
                                <form className="border border-gray-400 lg:p-6 p-4 Shadow lg:mt-10 mt-6" >
                                    <div className="space-y-2">
                                        <input type="text" placeholder="Tên" className={`${style.input}`} />
                                        <input type="text" placeholder="Email" className={`${style.input}`} />
                                        <input type="text" placeholder="Mục đích liên hệ" className={`${style.input}`} />
                                        <input type="text" placeholder="Nội dung" className={`${style.input}`} />
                                    </div>
                                    <button type="submit" className={`font-josefin ${style.button} text-xl lg:text-lg p-2 lg:mt-16 mt-8 underline lg:no-underline lg:hover:underline duration-300 ease-in-out`}>Gửi→</button>
                                </form>
                            </AnimatedText>
                        </div>
                    </div>
                </section>
            </AnimatedSection>
        </div>
    )
}