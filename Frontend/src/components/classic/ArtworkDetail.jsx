import AnimatedSection from "../comon/Animation/AnimatedSection";
import AnimatedTitle from "../comon/Animation/AnimatedTitle";
import AnimatedText from "../comon/Animation/AnimatedText";
import artworkApi from "../../api/artworkApi";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import likeApi from "../../api/likeApi";
import commentApi from "../../api/commentApi";
import collectionApi from "../../api/collectionApi";
import ErrorNoti from "../comon/Noti/Error";
import CommentThread from "../CommentThread";
import { io } from "socket.io-client";
import LostConnection from "../LostConnection";

export default function ArtworkDetailLayout({ noti, content, input, button, lang, style }) {
    const { slug } = useParams();
    const [artwork, setArtwork] = useState(null);
    const [liked, setLiked] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [addCollec, setAddCollec] = useState(false);
    const [menu, setMenu] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newCollecName, setNewCollecName] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [comment, setComment] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const [commentWrite, setCommentWrite] = useState("");
    const [err, setErr] = useState('');
    const [page, setPage] = useState(1);
    const [halgore, setHalgore] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [collection, setCollection] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const scrollRef = useRef(null);
    const observer = useRef(null);
    const [loadingComment, setLoadingComment] = useState(false);
    const [socketInstance, setSocketInstance] = useState(null);
    const [totalComment, setTotalComment] = useState(null);
    const [noGetArtwork, setNoGetArtwork] = useState(null);
    const [loadArtwork, setLoadArtwork] = useState(false);

    const TotalComment = async () => {
        if (!artwork?.id) return;
        const id = artwork?.id;
        try {
            const res = await commentApi.getTotalArtwork(id);
            setTotalComment(res?.data?.data);
        } catch (error) {
            console.log('Lỗi lấy tổng bình luận artwork!');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(payload.id || payload.userId);
                setCurrentUserRole(payload.role);
            } catch (error) {
            }
        }
    }, []);

    const getArtwork = async (slugArtwork) => {
        setLoadArtwork(true);
        setNoGetArtwork(null);
        try {
            const res = await artworkApi.getBySlug(slugArtwork);
            setArtwork(res?.data?.data);
        } catch (error) {
            setNoGetArtwork("Lỗi lấy tác phẩm!");
        } finally {
            setLoadArtwork(false);
        }
    };

    useEffect(() => {
        getArtwork(slug);
    }, [slug]);

    useEffect(() => {
        TotalComment();
        setPage(1);
        setHalgore(true);
        setComment([]);
    }, [artwork?.id]);

    useEffect(() => {
        if (!artwork?.id) return;
        const socket = io(import.meta.env.VITE_BACKEND_URL);
        setSocketInstance(socket);
        socket.emit("join_artwork", artwork.id);
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
            socket.emit("leave_artwork", artwork.id);
            socket.disconnect();
        };
    }, [artwork?.id]);

    const getDisplayYear = (year) => {
        if (!year) return noti.undef;
        return year;
    };

    const pgAttributes = artwork?.attributes?.[lang] || {};
    const mongoAttributes = artwork?.extended_info?.attributes?.[lang] || {};

    const displayAttributes = [
        ...Object.entries(pgAttributes),
        ...Object.entries(mongoAttributes).filter(
            ([key]) => !(key in pgAttributes)
        )
    ].map(([label, value]) => ({
        label,
        value
    }));

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!artwork || !artwork.id) return;
            try {
                const res = await artworkApi.recommended(
                    artwork.id,
                    artwork.artist_display_name,
                    artwork.layout_type,
                    undefined
                );
                setRecommendations(res?.data?.data || []);
            } catch (error) {
            }
        }
        fetchRecommendations();
    }, [artwork?.id]);

    const like = async (id) => {
        setLoading(true);
        try {
            const res = await likeApi.likeArtwork(id);
            if (res?.data?.is_liked !== undefined) {
                setLiked(res.data.is_liked);
            } else {
                setLiked((prev) => !prev);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const checkInitialLikeStatus = async () => {
            if (!artwork || !artwork.id) return;
            try {
                const res = await likeApi.checkLikeArtwork(artwork.id);
                setLiked(Boolean(res?.data));
            } catch (error) {
            }
        };
        checkInitialLikeStatus();
    }, [artwork?.id]);

    const getCollection = async () => {
        try {
            const res = await collectionApi.getMine();
            setCollection(res?.data?.data || []);
        } catch (error) {
            setCollection([]);
        }
    };

    useEffect(() => {
        getCollection();
    }, []);

    useEffect(() => {
        if (addCollec) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [addCollec]);

    const toggleAddCollec = () => {
        setAddCollec(!addCollec);
    };

    const toggleMenu = async () => {
        setMenu(!menu);
        if (menu) {
            setSearchQuery("");
        }
    };

    const filteredCollections = collection?.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];

    const addArtworkCollection = async (collecId) => {
        if (!collecId || !artwork?.id) return;
        setLoading(true);
        setErr('');
        try {
            await collectionApi.add(collecId, artwork.id);
            await getCollection();
        } catch (error) {
            setErr(noti.errArt);
        } finally {
            setLoading(false);
        }
    }

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const handleCreateAndAdd = async (e) => {
        e.preventDefault();
        if (!newCollecName.trim() || !artwork?.id) return;
        setLoading(true);
        setErr('');
        try {
            const rawPublic = !isPrivate;
            const resCreate = await collectionApi.create(newCollecName, rawPublic);
            const newCollectionId = resCreate?.data?.data?.id || resCreate?.data?.id;
            if (newCollectionId) await collectionApi.add(newCollectionId, artwork.id);
            await getCollection();
            setNewCollecName('');
            setIsPrivate(true);
            setAddCollec(false);
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    setErr(noti.expire);
                } else {
                    setErr(error.response.data?.message || noti.err);
                }
            } else if (error.request) {
                setErr(noti.errServer);
            } else {
                setErr(noti.err);
            }
        } finally {
            setLoading(false);
        }
    };

    const lastRef = useCallback(node => {
        if (loadingComment) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && halgore) setPage(prev => prev + 1);
        }, {
            rootMargin: "200px"
        });
        if (node) observer.current.observe(node);
    }, [loadingComment, halgore]);

    const getComment = async () => {
        if (!artwork?.id) return;
        setLoadingComment(true);
        const data = { limit: 10, page };
        const id = artwork.id;
        try {
            const res = await commentApi.getArtwork(id, data);
            const newComments = res?.data?.data || [];
            if (page === 1) {
                setComment(newComments);
            } else {
                setComment(prev => [...prev, ...newComments]);
            }
            if (newComments.length < 10) {
                setHalgore(false);
            }
        } catch (error) {
        } finally {
            setLoadingComment(false);
        }
    };

    useEffect(() => {
        if (artwork?.id) getComment();
    }, [artwork?.id, page]);

    const createComment = async (content, parentId) => {
        try {
            await commentApi.createArtwork(artwork.id, content, parentId);
            setCommentWrite('');
            setPage(1);
        } catch (error) {
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
            const res = await commentApi.likeComment(commentId, { artworkId: artwork.id });
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
        } catch (error) {
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
            await commentApi.delete(commentId, { artworkId: artwork.id });
        } catch (error) {
            setComment(previousComments);
            setErr(noti.errComment);
            setTimeout(() => setErr(''), 3000);
        }
    };

    if (loadArtwork) return <div className="h-screen -mt-4 Style-Heading2 flex items-center justify-center">{lang === "vi" ? "Đang tải..." : "Loading..."}</div>;
    if (noGetArtwork) return (<LostConnection click={getArtwork} lang={lang} />)

    return (
        <div className="relative">
            <div className="-mt-2 max-w-6xl mx-auto pb-10">
                <AnimatedSection className="pb-10 border-b border-gray-400 mb-10">
                    <AnimatedTitle className="lg:h-[60vh] w-full">
                        <img src={artwork?.media_url} alt={lang === 'en' ? (artwork?.title_en || artwork?.title) : artwork?.title} className="w-full h-full object-contain" />
                    </AnimatedTitle>
                </AnimatedSection>
                <AnimatedSection className="lg:space-y-2 space-y-4 relative">
                    <div className="flex">
                        <div className="flex-1">
                            <AnimatedTitle className="Style-Text1 text-black">
                                {lang === 'en' ? (artwork?.title_en || artwork?.title) : artwork?.title}
                            </AnimatedTitle>
                            <AnimatedText className="Style-Text1">
                                {artwork?.artist_id ? (<Link className="underline" to={`/user/${artwork?.artist_display_name.split(" #")[1]}`}>{artwork?.artist_display_name}</Link>) : (artwork?.artist_display_name)} - {getDisplayYear(artwork?.year)}
                            </AnimatedText>
                            <AnimatedText className="flex shrink-0 lg:gap-2 items-center">
                                <button type="button" disabled={loading} onClick={() => like(artwork?.id)} className="lg:hover:bg-black/20 transition-all duration-300 ease-out p-2 rounded-full">{liked ?
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="#f70000" d="M11.566 21.112L12 20.5za.75.75 0 0 0 .867 0L12 20.5l.434.612l.008-.006l.021-.015l.08-.058q.104-.075.295-.219a38.5 38.5 0 0 0 4.197-3.674c1.148-1.168 2.315-2.533 3.199-3.981c.88-1.44 1.516-3.024 1.516-4.612c0-1.885-.585-3.358-1.62-4.358c-1.03-.994-2.42-1.439-3.88-1.439c-1.725 0-3.248.833-4.25 2.117C10.998 3.583 9.474 2.75 7.75 2.75c-3.08 0-5.5 2.639-5.5 5.797c0 1.588.637 3.171 1.516 4.612c.884 1.448 2.051 2.813 3.199 3.982a38.5 38.5 0 0 0 4.492 3.892l.08.058l.021.015z" /></svg>
                                    :
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7.75 3.5C5.127 3.5 3 5.76 3 8.547C3 14.125 12 20.5 12 20.5s9-6.375 9-11.953C21 5.094 18.873 3.5 16.25 3.5c-1.86 0-3.47 1.136-4.25 2.79c-.78-1.654-2.39-2.79-4.25-2.79" /></svg>
                                }
                                </button>
                                <button type="button" onClick={toggleMenu} className={`Style-Text1  ${menu ? "bg-black/80 text-white" : "lg:hover:bg-black/20 text-black"} transition-all duration-300 ease-out p-2 rounded-xl`}>
                                    <div className="flex items-center gap-2">
                                        {content.collec} <svg height="14" role="img" viewBox="0 0 24 24" width="14"><path d="M23.7 8.7 12 20.42.3 8.71l1.4-1.42L12 17.6 22.3 7.3z" fill={menu ? "white" : "black"}></path></svg>
                                    </div>
                                </button>
                            </AnimatedText>
                        </div>
                        <AnimatedTitle className="lg:w-[20%] flex flex-col justify-center items-end space-y-2">
                            <img src="/User/img/Logo.png" alt='Mosaic Museum' draggable={false} className="object-contain w-12 h-12" />
                            <div className="Style-Text2 text-right text-sm select-none lg:block hidden">
                                Mosaic Museum <br /> {content.location}
                            </div>
                        </AnimatedTitle>
                    </div>
                    <AnimatedText className="Style-Text1 max-w-4xl ">{lang === 'en' ? (artwork?.description_en || artwork?.description) : artwork?.description}</AnimatedText>
                    <AnimatedTitle className="Style-Heading2 lg:text-3xl text-xl lg:py-6 py-4">
                        {content.about}
                    </AnimatedTitle>
                    <AnimatedText>
                        {displayAttributes.map((attr, index) => (
                            <div key={index} className="Style-Text1">
                                <span className="text-black text-left">
                                    {attr.label}:
                                </span>
                                <span className="text-left pl-1">
                                    {attr.value}
                                </span>
                            </div>
                        ))}
                    </AnimatedText>
                    {menu && (
                        <div className="bg-[#f9f6ec] overflow-y-auto z-10 p-2 lg:w-[30vw] w-[90vw] h-[50vh] lg:h-[60vh] absolute md:top-[9%] top-[5%] lg:left-[20%] left-1/2 -translate-x-1/2 rounded-xl shadow-xl">
                            <div className="sticky space-y-2 inset-0 z-10 bg-[#f9f6ec] -top-2">
                                <div className="flex justify-between items-center">
                                    <div className="Style-Heading2 text-xl pb-2">
                                        {content.save}
                                    </div>
                                    <div>
                                        <button type="button" onClick={toggleAddCollec}><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="#000" d="M12 3.25a.75.75 0 0 1 .75.75v7.25H20a.75.75 0 0 1 0 1.5h-7.25V20a.75.75 0 0 1-1.5 0v-7.25H4a.75.75 0 0 1 0-1.5h7.25V4a.75.75 0 0 1 .75-.75" /></svg></button>
                                    </div>
                                </div>
                                <div>
                                    {err && (<ErrorNoti err={err} />)}
                                </div>
                                <div>
                                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={input.search} className="Classic-Login-Input bg-[#f9f6ec]" />
                                </div>
                            </div>
                            <div className="space-y-2 ">
                                {filteredCollections.length === 0 ?
                                    <div className="Style-Text1 text-center">{content.create}</div>
                                    :
                                    filteredCollections?.map((item, index) => (
                                        <div key={item.id} className="flex items-center">
                                            <div className="flex items-center flex-1">
                                                <div className="w-[30%] relative h-[10vh]">
                                                    <div className="absolute inset-0 flex items-center justify-around">
                                                        <img src={item.cover_image ? item.cover_image : "/User/img/No_Image.png"} draggable={false} alt="Img" className="object-cover w-[80%] h-[80%] rounded-md" />
                                                    </div>
                                                </div>
                                                <div className="Style-Text1">
                                                    {item.name}
                                                </div>
                                            </div>
                                            <div className="w-12">
                                                <button disabled={loading} onClick={() => addArtworkCollection(item.id)} type="button" className="Style-Text1 text-base bg-[#0F3A32]/90 lg:hover:bg-[#0F3A32]/100 text-white p-2 rounded-md">{button.save}</button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </AnimatedSection>
                <AnimatedSection className="border-t border-gray-400">
                    <div className="flex justify-between items-center">
                        <AnimatedTitle className="Style-Heading2 lg:text-3xl text-xl lg:py-6 py-4">
                            {content.comment}
                        </AnimatedTitle>
                        <AnimatedTitle className="Style-Text1">
                            {totalComment} {content.comment}
                        </AnimatedTitle>
                    </div>
                    <form className="pb-6" onSubmit={(e) => { e.preventDefault(); createComment(commentWrite, undefined); }}>
                        <div className="flex flex-col items-end gap-2">
                            <div className="w-full">
                                <input type="text" onFocus={() => setIsFocused(true)} onBlur={() => { if (!commentWrite.trim()) setIsFocused(false); }} value={commentWrite} onChange={(e) => setCommentWrite(e.target.value)} placeholder={input.comment} className="bg-inherit w-full border-b border-gray-600 focus:outline-none focus:border-b-[2px] p-2 Style-Text2 text-black" />
                            </div>
                            {isFocused && (
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setCommentWrite('')} onMouseDown={() => { setCommentWrite(''); setIsFocused(false); }} className="p-1 Style-Text1 hover:text-white hover:bg-gray-500 rounded-full px-4">{button.cancel}</button>
                                    <button type="submit" disabled={!commentWrite.trim() || loading} className={`p-1 Style-Text1  ${!commentWrite.trim() || loading ? "text-white bg-gray-400 cursor-not-allowed" : "text-white bg-[#0F3A32]"} rounded-full px-4`}>{loading ? '...' : button.comment}</button>
                                </div>
                            )}
                        </div>
                    </form>
                    {comment.length === 0 ? (
                        <div className="Style-Text1">
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
                                            artworkId={artwork?.id}
                                            currentUserId={currentUserId}
                                            currentUserRole={currentUserRole}
                                            onDeleteRoot={handleDeleteComment}
                                            onLikeRoot={handleLikeComment}
                                            socket={socketInstance}
                                            type="classic"
                                            style={style}
                                        />
                                    </div>
                                );
                            })}
                            {loadingComment && page > 1 && (
                                <div className="text-center py-4 Style-Text1 text-base">
                                    {content.load}
                                </div>
                            )}
                        </div>
                    )}
                </AnimatedSection>
                <AnimatedSection className="w-full relative group">
                    <div className="flex justify-between items-center lg:py-6 py-4">
                        <AnimatedTitle className="Style-Heading2 lg:text-3xl text-xl">{content.same}</AnimatedTitle>
                        <AnimatedText className="flex gap-2">
                            <button onClick={() => scroll('left')} className="p-2 bg-white hover:bg-white/60 rounded-full transition">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="#000" d="m4 10l9 9l1.4-1.5L7 10l7.4-7.5L13 1z" /></svg>
                            </button>
                            <button onClick={() => scroll('right')} className="p-2 bg-white hover:bg-white/60 rounded-full transition">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="#000" d="M7 1L5.6 2.5L13 10l-7.4 7.5L7 19l9-9z" /></svg>
                            </button>
                        </AnimatedText>
                    </div>
                    <AnimatedText>
                        <div ref={scrollRef} className="flex gap-4 overflow-x-auto items-center scroll-smooth no-scrollbar" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
                            {recommendations.map((item, index) => (
                                <Link to={`/artwork/${item.slug}`} key={item.id} className="w-[60vw] md:w-[30vw] lg:w-[20vw] flex-none flex flex-col justify-center">
                                    <div className="overflow-hidden rounded-lg shadow-lg" title={item.title}>
                                        <img src={item.media_url} alt={item.title} className="w-full h-auto object-contain max-h-[60vh]" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </AnimatedText>
                </AnimatedSection>
            </div>
            <div className={`${addCollec ? 'block' : 'hidden'} bg-black/20 absolute inset-0 z-10`} />
            {addCollec && (
                <AnimatedSection className="absolute rounded-xl z-10 p-2 lg:space-y-4 space-x-2 lg:w-[50vw] w-[90vw] flex flex-col gap-4 border border-gray-800 shadow-2xl bg-[#f9f6ec] top-[1%] left-1/2 -translate-x-1/2">
                    <div className="flex justify-between items-center">
                        <div className="Style-Heading2 text-xl  lg:text-3xl flex-1 px-2">
                            {content.createCate}
                        </div>
                        <div className="w-10">
                            <button type="button" onClick={toggleAddCollec} className=" lg:hover:bg-black/20 transform-all duration-300 ease-out p-2 rounded-md"><svg width="30" height="30" viewBox="0 0 24 24"><path d="M7.4 6L6 7.4L10.6 12L6 16.6L7.4 18L12 13.4L16.6 18L18 16.6L13.4 12L18 7.4L16.6 6L12 10.6Z" /></svg></button>
                        </div>
                    </div>
                    {err && <div className="text-red-500 text-sm">{err}</div>}
                    <div className="flex flex-col gap-4">
                        <div className=" w-64 h-36 rounded-xl mx-auto">
                            <img src={artwork?.media_url} className="w-full h-full object-cover rounded-xl" />
                        </div>
                        <form className="flex flex-col gap-4" onSubmit={handleCreateAndAdd}>
                            <input value={newCollecName} onChange={(e) => setNewCollecName(e.target.value)} type="text" placeholder={input.collecName} className="Classic-Login-Input" />
                            <div className="flex justify-between">
                                <div className="">
                                    <div className="Style-Text1">
                                        {content.private}
                                    </div>
                                    <div className="Style-Text1 text-xs">
                                        {content.privateExplane}
                                    </div>
                                </div>
                                <div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-400 rounded-full peer-checked:bg-blue-500 transition-colors" />
                                        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                                    </label>
                                </div>
                            </div>
                            <button type="submit" disabled={!newCollecName.trim() || loading} className={`w-full p-2 Style-Text1 text-white text-center rounded-md transition-colors duration-200 ${!newCollecName.trim() || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0F3A32] lg:hover:bg-[#0a2621]'}`}>{loading ? button.creating : button.create}</button>
                        </form>
                    </div>
                </AnimatedSection>
            )}
        </div>
    )
}