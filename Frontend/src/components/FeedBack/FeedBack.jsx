import AnimatedSection from "../Animation/AnimatedSection";
import AnimatedTitle from "../Animation/AnimatedTitle";
import AnimatedText from "../Animation/AnimatedText";

export default function FeedbackLayout({style}) {
    return (
        <AnimatedSection>
            <div className='max-w-3xl lg:px-0 px-4 lg:mx-auto pb-10'>
                <AnimatedTitle>
                    <div className={`${style.heading} lg:text-4xl text-xl lg:pb-6 pb-4 text-center`}>
                        Hãy cho chúng tôi biết suy nghĩ của bạn
                    </div>
                </AnimatedTitle>
                <AnimatedText>
                    <form className='border Shadow border-gray-400 p-4 lg:p-6'>
                        <div className='space-y-4'>
                            <input type="text" placeholder="Tên" className={`${style.input}`} />
                            <input type="text" placeholder="Email" className={`${style.input}`} />
                            <input type="text" placeholder="Mục đích liên hệ" className={`${style.input}`} />
                            <input type="text" placeholder="Nội dung" className={`${style.input}`} />
                        </div>
                        <button type='submit' className={`font-josefin ${style.button} text-lg p-2 mt-8 lg:mt-16 underline lg:no-underline lg:hover:underline duration-300 ease-in-out`}>Gửi→</button>
                    </form>
                </AnimatedText>
            </div>
        </AnimatedSection>
    )
}