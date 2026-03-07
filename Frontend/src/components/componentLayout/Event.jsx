import PageTransition from "../comon/Animation/AnimatedPage"

export default function Event({ Title, Style }) {
    return (
        <PageTransition>
            <div className=" max-w-3xl lg:mx-auto lg:space-y-6 space-y-4 pb-10 lg:px-0 px-4">
                <div className={`${Style.heading} text-center lg:text-6xl text-3xl lg:pb-6 pb-4`}>{Title}</div>
                <section className="space-y-2">
                    <div className={`${Style.text} text-center`}>
                        Hiện tại chưa có sự kiện nào...
                    </div>
                </section>
            </div>
        </PageTransition>
    )
}