import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import eventApi from "../api/eventApi";
import likeApi from "../api/likeApi";
import commentApi from "../api/commentApi";
import { io } from "socket.io-client";
import CommentThread from "./CommentThread";
import AnimatedSection from "./comon/Animation/AnimatedSection";
import AnimatedTitle from "./comon/Animation/AnimatedTitle";
import AnimatedText from "./comon/Animation/AnimatedText";
import LostConnection from "./LostConnection";
import ErrorNoti from "./comon/Noti/Error";

export default function EventDetailLayout({ lang, content, input, button, style, type }) {
    const [event, setEvent] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isVideo, setIsVideo] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const { slug } = useParams();
    const [loadingComment, setLoadingComment] = useState(false);
    const [socketInstance, setSocketInstance] = useState(null);
    const [liked, setLiked] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [comment, setComment] = useState([]);
    const [commentWrite, setCommentWrite] = useState("");
    const [err, setErr] = useState('');
    const [page, setPage] = useState(1);
    const [halgore, setHalgore] = useState(true);
    const [isFocused, setIsFocused] = useState(false);
    const [totalComment, setTotalComment] = useState(null);
    const [viewerCount, setViewerCount] = useState(0);
    const observer = useRef(null);
    const [errEvent, setErrEvent] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(payload.id || payload.userId);
                setCurrentUserRole(payload.role);
            } catch {
                console.warn("Ignoring invalid event-page auth token.");
            }
        }
    }, []);

    const getLangText = (textData) => {
        if (!textData) return "";
        if (typeof textData === 'object' && textData[lang]) return textData[lang];
        if (typeof textData === 'string') {
            try { return JSON.parse(textData)[lang] || textData; }
            catch { return textData; }
        }
        return "";
    };

    const parseMultiLang = (data) => {
        if (!data) return { vi: "", en: "" };
        if (typeof data === 'string') {
            try {
                return JSON.parse(data);
            } catch {
                return { vi: data, en: "" };
            }
        }
        return data;
    };

    const lastRef = useCallback(node => {
        if (loadingComment) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && halgore) {
                setPage(prev => prev + 1);
            }
        }, {
            rootMargin: "200px"
        });
        if (node) observer.current.observe(node);
    }, [loadingComment, halgore]);

    const getComment = useCallback(async () => {
        if (!event?.id) return;
        setLoadingComment(true);
        const data = { limit: 10, page };
        const id = event?.id;
        try {
            const res = await commentApi.getEvent(id, data);
            const newComments = res?.data?.data || [];
            if (page === 1) {
                setComment(newComments);
            } else {
                setComment(prev => [...prev, ...newComments]);
            }
            if (newComments.length < 10) {
                setHalgore(false);
            }
        } catch {
            setErr(lang === "vi" ? "Không thể tải bình luận." : "Could not load comments.");
        } finally {
            setLoadingComment(false);
        }
    }, [event?.id, page, lang]);

    const TotalComment = useCallback(async () => {
        if (!event?.id) return;
        const id = event?.id;
        try {
            const res = await commentApi.getTotalEvent(id);
            setTotalComment(res?.data?.data);
        } catch {
            console.log('Lỗi lấy tổng bình luận event!');
        }
    }, [event?.id]);

    const getEventBySlug = useCallback(async (slugEvent) => {
        setLoading(true);
        setErrEvent(null);
        try {
            const res = await eventApi.getBySlug(slugEvent);
            const data = res.data.data;
            setEvent({
                id: data.id,
                title: parseMultiLang(data.title),
                slugArtwork: (data.slug_artwork === "null" || !data.slug_artwork) ? "" : data.slug_artwork,
                description: parseMultiLang(data.description),
                content: parseMultiLang(data.content),
                start_time: data.start_time,
                end_time: data.end_time
            });
            if (data.banner_url) {
                setPreviewUrl(data.banner_url);
                setIsVideo(Boolean(data.banner_url.match(/\.(mp4|mov|webm)$/i)));
            }
        } catch {
            setErrEvent("Lỗi lấy Event!");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getEventBySlug(slug);
    }, [getEventBySlug, slug]);

    useEffect(() => {
        TotalComment();
        setPage(1);
        setHalgore(true);
        setComment([]);
    }, [TotalComment, event?.id]);

    useEffect(() => {
        if (!event?.id) return;
        let sessionId = sessionStorage.getItem(`event_session:${event.id}`);
        if (!sessionId) {
            sessionId = Math.random().toString(36).substring(2) + Date.now();
            sessionStorage.setItem(`event_session:${event.id}`, sessionId);
        }
        const socket = io(import.meta.env.VITE_BACKEND_URL);
        setSocketInstance(socket);
        socket.emit("watch_event", { eventId: event.id, sessionId });
        socket.on("update_viewer_count", (data) => {
            setViewerCount(data.count);
        });
        socket.on("update_like_realtime", (data) => {
            const { commentId, newLikeCount } = data;
            setComment(prevComments => prevComments.map(c => {
                if (c.id === commentId) {
                    return { ...c, like_count: newLikeCount };
                }
                return c;
            }));
        });
        socket.on("new_comment_realtime", (data) => {
            setTotalComment(prev => prev + 1);
            if (!data.comment?.parent_id) {
                setComment(prevComments => [data.comment, ...prevComments]);
            } else {
                setComment(prevComments => prevComments.map(c => {
                    if (c.id === data.comment.parent_id) {
                        return { ...c, reply_count: Number(c.reply_count || 0) + 1 };
                    }
                    return c;
                }));
            }
        });
        socket.on("delete_comment_realtime", (data) => {
            setComment(prev => prev.filter(c => c.id !== data.commentId));
            setTotalComment(prev => Math.max(0, prev - 1));
        });
        return () => {
            socket.disconnect();
        };
    }, [event?.id]);

    const like = async (id) => {
        setIsLiking(true);
        try {
            const res = await likeApi.likeEvent(id);
            if (res?.data?.is_liked !== undefined) {
                setLiked(res.data.is_liked);
            } else {
                setLiked((prev) => !prev);
            }
        } catch {
            setErr(lang === "vi" ? "Không thể cập nhật lượt thích." : "Could not update the like.");
        } finally {
            setIsLiking(false);
        }
    };

    useEffect(() => {
        const checkInitialLikeStatus = async () => {
            if (!event?.id) return;
            try {
                const res = await likeApi.checkLikeEvent(event?.id);
                setLiked(Boolean(res?.data));
            } catch {
                setLiked(false);
            }
        };
        checkInitialLikeStatus();
    }, [event?.id]);

    useEffect(() => {
        if (event?.id) {
            getComment();
        }
    }, [event?.id, getComment]);

    const createComment = async (content, parentId) => {
        try {
            await commentApi.createEvent(event?.id, content, parentId);
            setCommentWrite('');
            setPage(1);
        } catch {
            setErr(lang === "vi" ? "Không thể gửi bình luận." : "Could not send the comment.");
        }
    };

    const handleLikeComment = async (commentId) => {
        setComment(prevComments => prevComments.map(c => {
            if (c.id === commentId) {
                const isCurrentlyLiked = c.is_liked_by_me;
                return {
                    ...c,
                    is_liked_by_me: !isCurrentlyLiked,
                    like_count: isCurrentlyLiked ? Number(c.like_count) - 1 : Number(c.like_count) + 1
                };
            }
            return c;
        }));
        try {
            const res = await commentApi.likeComment(commentId, { eventId: event?.id });
            if (res?.data) {
                setComment(prevComments => prevComments.map(c => {
                    if (c.id === commentId) {
                        return {
                            ...c,
                            is_liked_by_me: res.data.is_liked,
                            like_count: res.data.like_count
                        };
                    }
                    return c;
                }));
            }
        } catch {
            setComment(prevComments => prevComments.map(c => {
                if (c.id === commentId) {
                    const isCurrentlyLiked = c.is_liked_by_me;
                    return {
                        ...c,
                        is_liked_by_me: !isCurrentlyLiked,
                        like_count: isCurrentlyLiked ? Number(c.like_count) - 1 : Number(c.like_count) + 1
                    };
                }
                return c;
            }));
        }
    };

    const handleDeleteComment = async (commentId) => {
        const previousComments = [...comment];
        setComment(prevComments => prevComments.filter(c => c.id !== commentId));
        try {
            await commentApi.delete(commentId, { eventId: event?.id });
        } catch {
            setComment(previousComments);
            setErr(lang === "vi" ? "Không thể xóa bình luận." : "Could not delete the comment.");
            setTimeout(() => setErr(''), 3000);
        }
    };

    if (loading) return <div className={`h-screen -mt-4 ${type === "digital" ? "Digital-Heading" : "Style-Heading2"} flex items-center justify-center`}>{lang === "vi" ? "Đang tải..." : "Loading..."}</div>;

    if (errEvent) {
        return (<LostConnection click={getEventBySlug} lang={lang} />)
    }

    return (
        <AnimatedSection className="-mt-2 px-4 lg:px-0 max-w-6xl space-y-4 mx-auto pb-10">
            <AnimatedTitle className={`${style.heading} p-6`}>
                {getLangText(event?.title)}
            </AnimatedTitle>
            <AnimatedTitle className="flex justify-end lg:gap-2 items-center">
                <button type="button" disabled={isLiking} onClick={() => like(event?.id)} className="lg:hover:bg-black/20 transition-all duration-300 ease-out p-2 rounded-full">{liked ?
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="#f70000" d="M11.566 21.112L12 20.5za.75.75 0 0 0 .867 0L12 20.5l.434.612l.008-.006l.021-.015l.08-.058q.104-.075.295-.219a38.5 38.5 0 0 0 4.197-3.674c1.148-1.168 2.315-2.533 3.199-3.981c.88-1.44 1.516-3.024 1.516-4.612c0-1.885-.585-3.358-1.62-4.358c-1.03-.994-2.42-1.439-3.88-1.439c-1.725 0-3.248.833-4.25 2.117C10.998 3.583 9.474 2.75 7.75 2.75c-3.08 0-5.5 2.639-5.5 5.797c0 1.588.637 3.171 1.516 4.612c.884 1.448 2.051 2.813 3.199 3.982a38.5 38.5 0 0 0 4.492 3.892l.08.058l.021.015z" /></svg>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="none" stroke={style.like} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7.75 3.5C5.127 3.5 3 5.76 3 8.547C3 14.125 12 20.5 12 20.5s9-6.375 9-11.953C21 5.094 18.873 3.5 16.25 3.5c-1.86 0-3.47 1.136-4.25 2.79c-.78-1.654-2.39-2.79-4.25-2.79" /></svg>
                }
                </button>
                <div className="flex items-center gap-2 bg-green-100 border border-green-300 px-3 py-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span className={`${style.text1} font-bold text-green-800`}>
                        {viewerCount}
                    </span>
                </div>
            </AnimatedTitle>
            <AnimatedText className="flex lg:flex-row flex-col gap-4">
                <div className="lg:w-[40%] lg:p-0 p-4">
                    {previewUrl ? (isVideo ?
                        (<video src={previewUrl} autoPlay controls className="max-h-screen w-full object-contain" />)
                        :
                        (<img src={previewUrl} alt="Img" className="max-h-screen w-full object-contain" />)) : null}
                </div>
                <div className={`${style.text1} flex-1 lg:p-0 p-2`}>
                    {getLangText(event?.content)}
                </div>
            </AnimatedText>
            <AnimatedText className="border-t border-gray-400">
                {err && <ErrorNoti err={err} />}
                <div className="flex justify-between items-center lg:px-0 px-2">
                    <div className={`${style.heading} lg:text-3xl text-xl lg:py-6 py-4`}>
                        {content.comment}
                    </div>
                    <div className={style.text1}>
                        {totalComment} {content.comment}
                    </div>
                </div>
                <form className="pb-6" onSubmit={(e) => { e.preventDefault(); createComment(commentWrite, undefined); }}>
                    <div className="flex flex-col items-end gap-2">
                        <div className="w-full">
                            <input type="text" onFocus={() => setIsFocused(true)} onBlur={() => { if (!commentWrite.trim()) setIsFocused(false); }} value={commentWrite} onChange={(e) => setCommentWrite(e.target.value)} placeholder={input.comment} className={`bg-inherit w-full border-b border-gray-600 focus:outline-none focus:border-b-[2px] p-2 ${style.text2}`} />
                        </div>
                        {isFocused && (
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setCommentWrite('')} onMouseDown={() => { setCommentWrite(''); setIsFocused(false); }} className={`p-1 ${style.text1} hover:text-white hover:bg-gray-500 rounded-full px-4`}>{button.cancel}</button>
                                <button type="submit" disabled={!commentWrite.trim() || loading} className={`p-1 ${style.text1}  ${!commentWrite.trim() || loading ? "text-white bg-gray-400 cursor-not-allowed" : type === "classic" ? "text-white bg-[#0F3A32]" : "text-black bg-white"} rounded-full px-4`}>{loading ? '...' : button.comment}</button>
                            </div>
                        )}
                    </div>
                </form>
                {comment.length === 0 ? (
                    <div className={style.text1}>
                        {content.noComment}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {comment?.map((item, index) => {
                            const isLastComment = comment.length === index + 1;
                            return (
                                <div key={item.id} ref={isLastComment ? lastRef : null}>
                                    <CommentThread
                                        lang={lang}
                                        rootComment={item}
                                        eventId={event?.id}
                                        currentUserId={currentUserId}
                                        currentUserRole={currentUserRole}
                                        onDeleteRoot={handleDeleteComment}
                                        onLikeRoot={handleLikeComment}
                                        socket={socketInstance}
                                        type={type}
                                        style={style}
                                    />
                                </div>
                            );
                        })}
                        {loadingComment && page > 1 && (
                            <div className={`text-center py-4 ${style.text1} text-base`}>
                                {content.load}
                            </div>
                        )}
                    </div>
                )}
            </AnimatedText>
        </AnimatedSection>
    )

}