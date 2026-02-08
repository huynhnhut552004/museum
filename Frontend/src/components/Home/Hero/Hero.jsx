export default function Hero({video, title}){
    return (
        <section className="-mt-4 mb-10">
            <div className="w-full lg:h-[70vh] h-[40vh] relative">
                <video className="Style-Video" autoPlay loop muted playsInline>
                    <source src={video} type="video/mp4"/>
                </video>
                <div className="bg-black/60 absolute w-full h-full inset-0"></div>
                <div className="Style-Heading2 select-none text-white text-center absolute inset-0 w-full h-full flex items-center justify-center">{title}</div>
            </div>
        </section>
    )
}