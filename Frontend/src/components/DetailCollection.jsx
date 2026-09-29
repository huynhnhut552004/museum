import AnimatedSection from "./comon/Animation/AnimatedSection";
import AnimatedTitle from "./comon/Animation/AnimatedTitle";
import AnimatedText from "./comon/Animation/AnimatedText";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import collectionApi from "../api/collectionApi";
import LostConnection from "./LostConnection";

export default function DetailCollectionLayout({ style, lang, noti }) {
    const { id } = useParams();
    const [data, setdata] = useState({});
    const [errLoad, setErrLoad] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const navigate = useNavigate();

    const getArtwork = useCallback(async () => {
        try {
            setErrLoad(false);
            setLoading(true);
            setErr(null);
            setdata({});
            const res = await collectionApi.getDetail(id);
            setdata(res.data.data);
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                if (status === 403) {
                    setErr(noti.private);
                    setTimeout(() => {
                        navigate(-1);
                    }, 3000);
                } else {
                    setErrLoad(true);
                }
            } else {
                setErrLoad(true);
            }
        } finally {
            setLoading(false);
        }
    }, [id, noti.private, navigate]);

    useEffect(() => {
        getArtwork();
    }, [getArtwork]);

    if (errLoad) return (<LostConnection lang={lang} click={getArtwork} />);
    if (loading) return (<div className={`h-screen -mt-4 ${style.heading} flex items-center justify-center`}>{lang === "vi" ? "Đang tải..." : "Loading..."}</div>)

    return (
        <AnimatedSection className="max-w-6xl mx-auto pb-10">
            <AnimatedTitle className="h-[10vh] mb-4 border-b border-gray-400">
                <AnimatedText className={`${style.heading} text-center`}>{data.name}</AnimatedText>
            </AnimatedTitle>
            <AnimatedTitle>
                <AnimatedText className=" overflow-x-hidden overflow-y-auto relative">
                    {err ? (
                        <div className={`${style.heading} flex items-center justify-center`}>{err}</div>
                    ) : (
                        data?.items?.length === 0 ? (
                            <div className={`${style.text} flex items-center justify-center`}>{lang === "vi" ? "Bộ sưu tập này rỗng." : "This collection is empty."}</div>
                        ) : (
                            <div className=" columns-2 md:columns-3 lg:columns-4 gap-2">
                                {data?.items?.map((item) => (
                                    <Link key={item.id} to={`/artwork/${item.slug}`}>
                                        <div className="relative mb-2 break-inside-avoid" title={item.title}>
                                            <img src={item.media_url} alt="Img" className="w-full h-auto block rounded-sm" />
                                            <div className="absolute inset-0 pointer-events-none bg-black/20 rounded-sm" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )
                    )}
                </AnimatedText>
            </AnimatedTitle>
        </AnimatedSection>
    );
}