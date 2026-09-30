import userApi from "../api/userApi";
import collectionApi from "../api/collectionApi";
import { useState, useEffect, useCallback } from "react";
import { Link, useParams, useLocation } from 'react-router-dom';
import AnimatedSection from "./comon/Animation/AnimatedSection";
import AnimatedText from "./comon/Animation/AnimatedText";
import AnimatedTitle from "./comon/Animation/AnimatedTitle";
import LostConnection from "./LostConnection";

export default function UserProfileLayout({ style, content, lang }) {
    const [loadUI, setLoadUI] = useState(false);
    const [errorloadInfo, setErrLoadInfo] = useState(false);
    const [collection, setCollection] = useState([]);
    const [mobile, setMobile] = useState(false);
    const [lock, setLock] = useState(null);
    const { userName } = useParams();
    const { state } = useLocation();
    const [info, setInfo] = useState(state?.infoUser || null);

    const fetchData = useCallback(async () => {
        try {
            setLoadUI(true);
            setErrLoadInfo(false);
            const user = state?.infoUser || (await userApi.getByTag(userName))?.data?.data;
            setInfo(user);
            const res = await collectionApi.getByUser(user.id);
            setCollection(res?.data?.data);
        } catch {
            setErrLoadInfo(true);
        } finally {
            setLoadUI(false);
        }
    }, [state?.infoUser, userName]);

    useEffect(() => {
        const handleResize = () => { setMobile(window.innerWidth < 1024); };
        fetchData();
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [fetchData]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (errorloadInfo) return (<LostConnection lang={lang} click={fetchData} />);
    if (loadUI) return <div className={`h-screen -mt-4 ${style.heading} flex items-center justify-center`}>{lang === "vi" ? "Đang tải..." : "Loading..."}</div>;

    return (
        <div className="max-w-6xl px-4 lg:px-0 flex flex-col mx-auto pb-10">
            <AnimatedSection className="space-y-4 order-3 pt-6">
                <AnimatedTitle className={style.heading}>
                    {content.title}
                </AnimatedTitle>
                <AnimatedText className={`${collection.length === 0 ? 'block' : 'hidden'} ${style.text} ${style.text_null_color} text-center`}>{content.null}</AnimatedText>
                <AnimatedText className={`${collection.length > 0 ? 'block' : 'hidden'} lg:px-0 px-2 grid lg:grid-cols-3 grid-cols-2 lg:gap-4 gap-2`}>
                    {collection.map((item) => (
                        <Link to={`collection/${item.id}`} key={item.id}>
                            <div className="lg:h-[36vh] h-[32vh] select-none relative border border-gray-800 rounded-md">
                                <img src="/User/img/No_Image.png" draggable={false} alt="Img" className={`${item.cover_image ? "hidden" : "block"} object-cover w-full h-full rounded-md `} />
                                <img src={item.cover_image} draggable={false} alt="Img" className={`${item.cover_image ? "block" : "hidden"} object-cover w-full h-full rounded-md `} />
                                <div className="absolute inset-0 bg-black/10" />
                                <div className={`${item.is_public ? "hidden" : "block"} absolute top-0 right-0 bg-black/60 rounded-tr-md rounded-bl-md`} onMouseEnter={!mobile ? () => setLock(item.id) : undefined} onMouseLeave={!mobile ? () => setLock(null) : undefined} onClick={mobile ? () => setLock(lock === item.id ? null : item.id) : undefined} >
                                    <img src="/User/icon/Lock.png" draggable={false} alt="Riêng tư" className=" w-10 h-auto" />
                                </div>
                                {lock === item.id && (
                                    <div className={`bg-black/20 absolute ${style.text} text-sm lg:top-2 lg:right-12 top-12 right-0 p-2 rounded-md text-white bg-black/60`}>{content.private1}</div>
                                )}
                                <div className={`${style.text} ${style.text_color_popup} absolute pointer-events-none inset-0 text-base flex justify-between items-end`}>
                                    <div className="text-white p-2 rounded-md bg-black/80">
                                        {item.item_count} {content.item}
                                    </div>
                                    <div className="text-white p-2 rounded-md bg-black/80">
                                        {formatDate(item.created_at)}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center px-2">
                                <div className={`${style.text} font-bold`}>
                                    {item.name}
                                </div>
                            </div>
                        </Link>
                    ))}
                </AnimatedText>
            </AnimatedSection>
            <AnimatedSection className="w-full flex lg:flex-row flex-col gap-4 justify-start lg:items-center pb-6 relative order-1">
                <AnimatedTitle className={`${style.heading} lg:text-3xl text-xl`}>
                    {lang === "vi" ? `${content.profile} ${info?.full_name} #${info?.user_tag}` : `${info?.full_name} #${info?.user_tag}${content.profile}`}
                </AnimatedTitle>
            </AnimatedSection>
            <AnimatedSection className={`order-2 rounded-lg border ${style.border} p-6 md:p-8`}>
                <AnimatedTitle className="grid grid-cols-1 md:grid-cols-2">
                    <AnimatedText className={`border-b ${style.border} p-4 md:border-r`}>
                        <div className={`text-xs font-medium uppercase tracking-[0.2em] opacity-80 ${style.textColor}`}>
                            {content.nickname}
                        </div>
                        <div className={`${style.text} mt-2 text-lg`}>
                            {info?.info?.nickName}
                        </div>
                    </AnimatedText>
                    <AnimatedText className={`border-b ${style.border} p-4 md:pl-6`}>
                        <div className={`text-xs font-medium uppercase tracking-[0.2em] opacity-80 ${style.textColor}`}>
                            {content.birthday}
                        </div>
                        <div className={`${style.text} mt-2 text-lg`}>
                            {info?.info?.birthday}
                        </div>
                    </AnimatedText>
                    <AnimatedText className={`border-b ${style.border} p-4 md:border-r`}>
                        <div className={`text-xs font-medium uppercase tracking-[0.2em] opacity-80 ${style.textColor}`}>
                            Email
                        </div>
                        <div className={`${style.text} mt-2 text-lgbreak-all`}>
                            {info?.info?.email}
                        </div>
                    </AnimatedText>
                    <AnimatedText className={`border-b ${style.border} p-4 md:pl-6`}>
                        <div className={`text-xs font-medium uppercase tracking-[0.2em] opacity-80 ${style.textColor}`}>
                            {content.hobby}
                        </div>
                        <div className={`${style.text} mt-2 text-lg`}>
                            {info?.info?.hobby}
                        </div>
                    </AnimatedText>
                    <AnimatedText className="col-span-full p-4 pt-6">
                        <div className={`text-xs font-medium uppercase tracking-[0.2em] opacity-80 ${style.textColor}`}>
                            {content.description}
                        </div>
                        <div className={`${style.text} mt-3 max-w-3xl leading-relaxed`}>
                            {info?.info?.description}
                        </div>
                    </AnimatedText>
                </AnimatedTitle>
            </AnimatedSection>
        </div >
    )
}