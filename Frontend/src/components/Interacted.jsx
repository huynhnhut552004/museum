import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AnimatedSection from "./comon/Animation/AnimatedSection";
import AnimatedTitle from "./comon/Animation/AnimatedTitle";
import likeApi from "../api/likeApi";
import LostConnection from "./LostConnection";

export default function InteractedLayout({ style, content, lang }) {
    const [data, setData] = useState([]);
    const [filter, setfilter] = useState('');
    const [errLoad, setErrLoad] = useState(false);
    const [path, setPath] = useState(window.location.pathname);

    const getInterac = async (filter) => {
        try {
            setErrLoad(false);
            const res = await likeApi.getLikeByMe(filter);
            setData(res?.data?.data);
            console.log(res.data.data)
        } catch (error) {
            setErrLoad(true);
        }
    };

    useEffect(() => {
        getInterac(filter);
    }, [filter]);

    const handleOnChange = (e) => {
        const value = e.target.value;
        setfilter(value);
    };

    if (errLoad) return (<LostConnection lang={lang} click={getInterac} />)

    return (
        <AnimatedSection className="max-w-6xl mx-auto pb-10">
            <div className="border-b border-gray-400 pb-2 mb-4">
                <AnimatedTitle className={`${style.heading} text-center`}>{content.heading}</AnimatedTitle>
                <div className="text-right">
                    <select value={filter} name="filter" onChange={handleOnChange} className={` h-[50px] ${style.text} focus:outline-none bg-inherit heading-body text border border-gray-600 rounded-md`}>
                        <option value="" className={`${style.bg}`}>{content.option1}</option>
                        <option value="artwork" className={`${style.bg}`}>{content.option2}</option>
                        <option value="event" className={`${style.bg}`}>{content.option3}</option>
                    </select>
                </div>
            </div>
            <div>
                <AnimatedTitle className="flex flex-col gap-4">
                    {data.length > 0 ? (
                        data.map((item) => {
                            const isDigital = item.type === 'artwork' ? item.layout_type === 'digital' : path.startsWith('/digital');
                            const title = item.type === 'event' ? JSON.parse(item.title)[lang] : item.title;
                            return (
                                <Link key={item.id} to={`${isDigital ? '/digital' : ''}/${item.type}/${item.slug}`} className="flex gap-2">
                                    <div className="lg:w-[20%] w-[40%] h-[20vh] rounded-md overflow-hidden">
                                        <img src={item.image_url} alt={title} className="w-full h-full object-cover"/>
                                    </div>
                                    <div className={`flex lg:flex-row lg:justify-normal justify-evenly flex-col ${style.heading} lg:gap-2 gap-1 text-base lg:text-xl`}>
                                        <div>{title}</div>
                                        {item.author_name && (
                                            <>
                                                <div className="lg:block hidden">-</div>
                                                <div>{item.author_name}</div>
                                            </>
                                        )}
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className={`text-center ${style.text} py-10`}>{content.null}</div>
                    )}
                </AnimatedTitle>
            </div>
        </AnimatedSection>
    )
}