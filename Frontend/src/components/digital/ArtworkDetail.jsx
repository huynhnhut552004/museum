import AnimatedSection from '../comon/Animation/AnimatedSection';
import AnimatedTitle from '../comon/Animation/AnimatedTitle';
import AnimatedText from '../comon/Animation/AnimatedText';
import { useEffect, useState, useRef, useCallback } from 'react';
import likeApi from '../../api/likeApi';
import commentApi from '../../api/commentApi';
import collectionApi from '../../api/collectionApi';
import { io } from "socket.io-client";
import CommentThread from '../CommentThread';
import artworkApi from "../../api/artworkApi";
import ErrorNoti from '../comon/Noti/Error';
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LostConnection from '../LostConnection';

const MotionDiv = motion.div;

export default function ArtworkDetailDigitalLayout({ noti, content, input, button, lang, style }) {
    const { slug } = useParams();
    const [view, setView] = useState('artworkDetail');
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

    const slideAnimation = {
        initial: { y: 300, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -300, opacity: 0 },
        transition: {
            duration: 0.3,
            ease: "easeInOut"
        }
    };

    const TotalComment = useCallback(async () => {
        if (!artwork?.id) return;
        const id = artwork?.id;
        try {
            const res = await commentApi.getTotalArtwork(id);
            setTotalComment(res?.data?.data);
        } catch {
            console.log('Lỗi lấy tổng bình luận artwork!');
        }
    }, [artwork?.id]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(payload.id || payload.userId);
                setCurrentUserRole(payload.role);
            } catch {
                console.warn("Ignoring invalid artwork-page auth token.");
            }
        }
    }, []);

    const getArtwork = useCallback(async (slugArtwork) => {
        setLoadArtwork(true);
        setNoGetArtwork(null);
        try {
            const res = await artworkApi.getBySlug(slugArtwork);
            setArtwork(res?.data?.data);
        } catch {
            setNoGetArtwork("Lỗi lấy tác phẩm!");
        } finally {
            setLoadArtwork(false);
        }
    }, []);

    useEffect(() => {
        getArtwork(slug);
    }, [getArtwork, slug]);

    useEffect(() => {
        TotalComment();
        setPage(1);
        setHalgore(true);
        setComment([]);
    }, [artwork?.id, TotalComment]);

    const artworkId = artwork?.id;
    const artistName = artwork?.artist_display_name;
    const artworkLayout = artwork?.layout_type;

    useEffect(() => {
        if (!artworkId) return;
        const socket = io(import.meta.env.VITE_BACKEND_URL);
        setSocketInstance(socket);
        socket.emit("join_artwork", artworkId);
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
            socket.emit("leave_artwork", artworkId);
            socket.disconnect();
        };
    }, [artworkId]);

    const pgAttributes = artwork?.attributes?.[lang] || {};
    const mongoAttributes = artwork?.extended_info?.attributes?.[lang] || {};

    const displayAttributes = [
        ...Object.entries(pgAttributes),
        ...Object.entries(mongoAttributes).filter(([key]) => !(key in pgAttributes))
    ].map(([label, value]) => ({ label, value }));

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!artworkId) return;
            try {
                const res = await artworkApi.recommended(
                    artworkId,
                    artistName,
                    artworkLayout,
                    undefined
                );
                setRecommendations(res?.data?.data || []);
            } catch {
                setRecommendations([]);
            }
        }
        fetchRecommendations();
    }, [artworkId, artistName, artworkLayout]);

    const like = async (id) => {
        setLoading(true);
        try {
            const res = await likeApi.likeArtwork(id);
            if (res?.data?.is_liked !== undefined) {
                setLiked(res.data.is_liked);
            } else {
                setLiked((prev) => !prev);
            }
        } catch {
            setErr(noti.err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const checkInitialLikeStatus = async () => {
            if (!artworkId) return;
            try {
                const res = await likeApi.checkLikeArtwork(artworkId);
                setLiked(Boolean(res?.data));
            } catch {
                setLiked(false);
            }
        };
        checkInitialLikeStatus();
    }, [artworkId]);

    const getCollection = async () => {
        try {
            const res = await collectionApi.getMine();
            setCollection(res?.data?.data || []);
        } catch {
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
        if (menu) setSearchQuery("");
    };

    const filteredCollections = collection?.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];

    const addArtworkCollection = async (collecId) => {
        if (!collecId || !artwork?.id) return;
        setLoading(true);
        setErr('');
        try {
            await collectionApi.add(collecId, artwork.id);
            await getCollection();
        } catch {
            setErr(noti.errArt);
        } finally {
            setLoading(false);
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
            if (newCollectionId) {
                await collectionApi.add(newCollectionId, artwork.id);
            }
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

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
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

    const getComment = useCallback(async () => {
        if (!artwork?.id) return;
        setLoadingComment(true);
        const params = { limit: 10, page };
        const id = artwork.id;
        try {
            const res = await commentApi.getArtwork(id, params);
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
            setErr(noti.errComment);
        } finally {
            setLoadingComment(false);
        }
    }, [artwork?.id, page, noti.errComment]);

    useEffect(() => {
        if (artwork?.id) getComment();
    }, [artwork?.id, page, getComment]);

    const createComment = async (content, parentId) => {
        try {
            await commentApi.createArtwork(artwork.id, content, parentId);
            setCommentWrite('');
            setPage(1);
        } catch {
            setErr(noti.errComment);
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
            await commentApi.delete(commentId, { artworkId: artwork.id });
        } catch {
            setComment(previousComments);
            setErr(noti.errComment);
            setTimeout(() => setErr(''), 3000);
        }
    };

    const getDisplayYear = (year) => {
        if (!year) return noti.undef;
        return year;
    };

    if (loadArtwork) return <div className="h-screen -mt-4 Digital-Heading flex items-center justify-center">{lang === "vi" ? "Đang tải..." : "Loading..."}</div>;
    if (noGetArtwork) return (<LostConnection click={getArtwork} lang={lang} />)

    return (
        <div className="relative lg:h-[90vh] h-[150vh] w-full -mt-6">
            <div className='w-full h-full lg:block hidden'>
                <img src={artwork?.media_url} className='w-full h-full object-cover' />
                <div className='bg-black/70 absolute inset-0' />
            </div>
            <div className='lg:gap-6 gap-4 grid-cols-[35%_1fr] grid-rows-[20%_1fr] lg:grid flex flex-col w-[95%] mx-auto lg:h-[90%] pb-4 lg:pb-0 h-[100%] lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2'>
                <AnimatedSection className='lg:order-1 order-2 row-span-2 relative backdrop-blur-xl backdrop-saturate-150 lg:p-0 py-4 shadow-2xl bg-white/10 border border-gray-400 rounded-xl'>
                    <AnimatedTitle className='lg:absolute lg:inset-0 flex flex-col items-center justify-center'>
                        <AnimatedTitle className='Digital-Heading'>{lang === 'en' ? (artwork?.title_en || artwork?.title) : artwork?.title}</AnimatedTitle>
                        <img src={artwork?.media_url} className='max-w-[80%] max-h-[80%] object-contain border border-white]' />
                    </AnimatedTitle>
                </AnimatedSection>
                <div className='lg:order-2 order-1 lg:border-b lg:border-gray-100 p-4 flex w-full gap-4 items-end justify-end'>
                    <button type="button" disabled={loading} onClick={() => like(artwork?.id)} className="lg:hover:bg-white/20 transition-all duration-300 ease-out p-2 rounded-full">{liked ?
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="#f70000" d="M11.566 21.112L12 20.5za.75.75 0 0 0 .867 0L12 20.5l.434.612l.008-.006l.021-.015l.08-.058q.104-.075.295-.219a38.5 38.5 0 0 0 4.197-3.674c1.148-1.168 2.315-2.533 3.199-3.981c.88-1.44 1.516-3.024 1.516-4.612c0-1.885-.585-3.358-1.62-4.358c-1.03-.994-2.42-1.439-3.88-1.439c-1.725 0-3.248.833-4.25 2.117C10.998 3.583 9.474 2.75 7.75 2.75c-3.08 0-5.5 2.639-5.5 5.797c0 1.588.637 3.171 1.516 4.612c.884 1.448 2.051 2.813 3.199 3.982a38.5 38.5 0 0 0 4.492 3.892l.08.058l.021.015z" /></svg>
                        :
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7.75 3.5C5.127 3.5 3 5.76 3 8.547C3 14.125 12 20.5 12 20.5s9-6.375 9-11.953C21 5.094 18.873 3.5 16.25 3.5c-1.86 0-3.47 1.136-4.25 2.79c-.78-1.654-2.39-2.79-4.25-2.79" /></svg>
                    }
                    </button>
                    <button type="button" onClick={toggleMenu} className={`Digital-Text1  ${menu ? "bg-white text-black" : "lg:hover:bg-white/20 text-white"} transition-all duration-300 ease-out p-2 rounded-xl`}>
                        <div className="flex items-center gap-2">
                            {content.collec} <svg height="14" role="img" viewBox="0 0 24 24" width="14"><path d="M23.7 8.7 12 20.42.3 8.71l1.4-1.42L12 17.6 22.3 7.3z" fill={menu ? "black" : "white"}></path></svg>
                        </div>
                    </button>
                    <div className="flex flex-col justify-center items-end space-y-2">
                        <img src="/User/img/Logo_Invert.png" alt='Mosaic Museum' draggable={false} className="object-contain w-12 h-12" />
                        <div className="Digital-Text1 text-right text-sm select-none lg:block hidden">
                            Mosaic Museum <br /> {content.location}
                        </div>
                    </div>
                </div>
                {menu && (
                    <div className="bg-[#191B1D] border overflow-y-auto no-scrollbar z-10 p-2 lg:w-[30vw] w-[90vw] h-[50vh] lg:h-[60vh] absolute top-[8%] left-1/2 -translate-x-1/2 lg:top-[20%] lg:left-[78%] rounded-xl">
                        <div className="sticky space-y-2 inset-0 z-10 -top-2">
                            <div className="flex justify-between items-center">
                                <div className="Digital-Heading text-2xl pb-2">
                                    {content.save}
                                </div>
                                <div>
                                    <button type="button" onClick={toggleAddCollec}><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="#ffffff" d="M12 3.25a.75.75 0 0 1 .75.75v7.25H20a.75.75 0 0 1 0 1.5h-7.25V20a.75.75 0 0 1-1.5 0v-7.25H4a.75.75 0 0 1 0-1.5h7.25V4a.75.75 0 0 1 .75-.75" /></svg></button>
                                </div>
                            </div>
                            <div>
                                {err && (<ErrorNoti err={err} />)}
                            </div>
                            <div>
                                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={input.search} className="Digital-Login-Input" />
                            </div>
                        </div>
                        <div className="space-y-2 ">
                            {filteredCollections.length === 0 ?
                                <div className="Digital-Text1 text-center">{content.create}</div>
                                :
                                filteredCollections?.map((item) => (
                                    <div key={item.id} className="flex items-center">
                                        <div className="flex items-center flex-1">
                                            <div className="w-[30%] relative h-[10vh]">
                                                <div className="absolute inset-0 flex items-center justify-around">
                                                    <img src={item.cover_image ? item.cover_image : "/User/img/No_Image.png"} draggable={false} alt="Img" className="block w-full max-w-full object-contain max-h-[80%] border-2 border-white" />
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
                <div className='w-full min-h-0 min-w-0 flex lg:flex-row flex-col lg:items-stretch items-center lg:gap-1 gap-2 order-3'>
                    <div className='flex-1 self-stretch min-w-0 min-h-0 lg:order-1 order-2'>
                        <AnimatePresence mode='wait'>
                            {view === "artworkDetail" && (
                                <MotionDiv key="artworkDetail" {...slideAnimation} className='rounded-xl backdrop-saturate-150 shadow-2xl backdrop-blur-xl bg-white/10 border border-gray-400 px-14 py-2 h-full overflow-y-auto no-scrollbar'>
                                    <AnimatedSection>
                                        <AnimatedTitle className='Digital-Heading text-2xl'>
                                            {artwork?.artist_id ? (<Link className="underline" to={`/user/${artwork?.artist_display_name.split(" #")[1]}`}>{artwork?.artist_display_name}</Link>) : (artwork?.artist_display_name)} - {getDisplayYear(artwork?.year)}
                                        </AnimatedTitle>
                                        <AnimatedText className='Digital-Text1'>
                                            {lang === "vi" ? artwork?.description : artwork?.description_en}
                                        </AnimatedText>
                                        <AnimatedTitle className='Digital-Heading py-4'>
                                            {content.about}
                                        </AnimatedTitle>
                                        <AnimatedText>
                                            {displayAttributes.map((attr, index) => (
                                                <div key={index} className="Digital-Text1">
                                                    <span className=" text-left">
                                                        {attr.label}:
                                                    </span>
                                                    <span className="text-left pl-1">
                                                        {attr.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </AnimatedText>
                                    </AnimatedSection>
                                </MotionDiv >
                            )}
                            {view === "comment" && (
                                <MotionDiv key="comment" {...slideAnimation} className="rounded-xl backdrop-saturate-150 shadow-2xl backdrop-blur-xl bg-white/10 border border-gray-400 px-14 py-2 w-full h-full min-w-0 min-h-0 flex flex-col overflow-hidden">
                                    <AnimatedSection className="flex justify-between items-center shrink-0">
                                        <AnimatedTitle className="Digital-Heading lg:text-3xl text-xl lg:py-6 py-4">
                                            {content.comment}
                                        </AnimatedTitle>
                                        <AnimatedTitle className="Digital-Text1">
                                            {totalComment} {content.comment}
                                        </AnimatedTitle>
                                    </AnimatedSection>
                                    <AnimatedSection className="shrink-0">
                                        <form className="pb-6" onSubmit={(e) => { e.preventDefault(); createComment(commentWrite, undefined); }}>
                                            <AnimatedTitle className="flex flex-col items-end gap-2">
                                                <div className="w-full">
                                                    <input type="text" onFocus={() => setIsFocused(true)} onBlur={() => { if (!commentWrite.trim()) setIsFocused(false); }} value={commentWrite} onChange={(e) => setCommentWrite(e.target.value)} placeholder={input.comment} className="bg-inherit w-full border-b border-gray-100 focus:outline-none focus:border-b-[2px] p-2 Digital-Text2 " />
                                                </div>
                                                {isFocused && (
                                                    <div className="flex gap-4">
                                                        <button type="button" onClick={() => setCommentWrite('')} onMouseDown={() => { setCommentWrite(''); setIsFocused(false); }} className="p-1 Digital-Text1 hover:text-white hover:bg-gray-500 rounded-full px-4">{button.cancel}</button>
                                                        <button type="submit" disabled={!commentWrite.trim() || loading} className={`p-1 Style-Text1  ${!commentWrite.trim() || loading ? "text-gray-500 bg-gray-400 cursor-not-allowed" : "text-black bg-white"} rounded-full px-4`}>{loading ? '...' : button.comment}</button>
                                                    </div>
                                                )}
                                            </AnimatedTitle>
                                        </form>
                                    </AnimatedSection>
                                    <AnimatedSection className="flex-1 min-h-0 min-w-0 w-full">
                                        {comment.length === 0 ? (
                                            <AnimatedTitle className="Digital-Text1">
                                                {content.noComment}
                                            </AnimatedTitle>
                                        ) : (
                                            <div className="flex flex-col gap-4 w-full h-full min-w-0 overflow-y-auto no-scrollbar">
                                                {comment?.map((item, index) => {
                                                    const isLastComment = comment.length === index + 1;
                                                    return (
                                                        <div key={item.id} ref={isLastComment ? lastRef : null} className="min-w-0 max-w-full">
                                                            <CommentThread
                                                                lang={lang}
                                                                rootComment={item}
                                                                artworkId={artwork?.id}
                                                                currentUserId={currentUserId}
                                                                currentUserRole={currentUserRole}
                                                                onDeleteRoot={handleDeleteComment}
                                                                onLikeRoot={handleLikeComment}
                                                                socket={socketInstance}
                                                                type="digital"
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
                                </MotionDiv>
                            )}
                            {view === "recommend" && (
                                <MotionDiv key="recommend" {...slideAnimation} className="w-full h-full min-w-0 min-h-0 flex flex-col overflow-hidden rounded-xl backdrop-saturate-150 shadow-2xl backdrop-blur-xl bg-white/10 border border-gray-400 px-4 lg:px-14">
                                    <AnimatedSection className="flex justify-between items-center shrink-0 lg:py-6 py-4">
                                        <AnimatedTitle className="Digital-Heading lg:text-3xl text-xl">
                                            {content.same}
                                        </AnimatedTitle>
                                        <AnimatedTitle className="flex gap-2 shrink-0">
                                            <button onClick={() => scroll('left')} className="p-2 bg-white hover:bg-white/60 rounded-full transition">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="#000" d="m4 10l9 9l1.4-1.5L7 10l7.4-7.5L13 1z" /></svg>
                                            </button>
                                            <button onClick={() => scroll('right')} className="p-2 bg-white hover:bg-white/60 rounded-full transition">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="#000" d="M7 1L5.6 2.5L13 10l-7.4 7.5L7 19l9-9z" /></svg>
                                            </button>
                                        </AnimatedTitle>
                                    </AnimatedSection>
                                    <AnimatedSection className="flex-1 min-w-0 min-h-0 w-full overflow-hidden">
                                        <AnimatedTitle className="w-full h-full min-w-0 min-h-0">
                                            <div ref={scrollRef} className=" flex w-full h-full min-w-0 max-w-full gap-4 overflow-x-auto overflow-y-hidden touch-pan-x items-center scroll-smooth no-scrollbar" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                                                {recommendations.map((item) => (
                                                    <Link to={`/digital/artwork/${item.slug}`} key={item.id} className="shrink-0 w-[70%] sm:w-[60%] md:w-[30vw] lg:w-[20vw] flex flex-col justify-center">
                                                        <div className="w-full overflow-hidden shadow-lg" title={item.title}>
                                                            <img src={item.media_url} alt={item.title} className="block w-full max-w-full object-contain max-h-[80%] border-2 border-white" />
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </AnimatedTitle>
                                    </AnimatedSection>
                                </MotionDiv>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className='flex justify-center items-center w-[10%] lg:order-2 order-1'>
                        <div className=" flex lg:flex-col gap-2 p-1.5 rounded-full bg-black/80 backdrop-blur-xl border border-white/30 shadow-2x">
                            <button onClick={() => setView("artworkDetail")} className=" relative w-11 h-11 flex items-center justify-center rounded-full transition-colors duration-300">
                                {view === "artworkDetail" && (
                                    <MotionDiv layoutId="active-navigation" className="absolute inset-0 rounded-full bg-white" transition={{ type: "spring", stiffness: 500, damping: 35, }} />
                                )}
                                <svg className={`relative z-10 w-5 h-5 transition-colors duration-300 ${view === "artworkDetail" ? "text-black" : "text-white/60"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2M5 19V5h14v14z" /><path fill="currentColor" d="M7 7h10v2H7zm0 4h10v2H7zm0 4h10v2H7z" /></svg>
                            </button>
                            <button onClick={() => setView("comment")} className="relative w-11 h-11 flex items-center justify-center rounded-full transition-colors duration-300">
                                {view === "comment" && (
                                    <MotionDiv layoutId="active-navigation" className="absolute inset-0 rounded-full bg-white" transition={{ type: "spring", stiffness: 500, damping: 35, }} />
                                )}
                                <svg className={`relative z-10 w-5 h-5 transition-colors duration-300 ${view === "comment" ? "text-black" : "text-white/60"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2"><path strokeLinejoin="round" d="M14 19c3.771 0 5.657 0 6.828-1.172S22 14.771 22 11s0-5.657-1.172-6.828S17.771 3 14 3h-4C6.229 3 4.343 3 3.172 4.172S2 7.229 2 11s0 5.657 1.172 6.828c.653.654 1.528.943 2.828 1.07" /><path d="M14 19c-1.236 0-2.598.5-3.841 1.145c-1.998 1.037-2.997 1.556-3.489 1.225s-.399-1.355-.212-3.404L6.5 17.5" /></g></svg>
                            </button>
                            <button onClick={() => setView("recommend")} className="relative w-11 h-11 flex items-center justify-center rounded-full transition-colors duration-300">
                                {view === "recommend" && (
                                    <MotionDiv layoutId="active-navigation" className="absolute inset-0 rounded-full bg-white" transition={{ type: "spring", stiffness: 500, damping: 35, }} />
                                )}
                                <svg className={`relative z-10 w-5 h-5 transition-colors duration-300 ${view === "recommend" ? "text-black" : "text-white/60"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048"><path d="M0 0h2048v2048H0z" fill="none" /><path fill="currentColor" d="M1792 640h256v1152H512v-256H256v-256H0V128h1536v256h256zM128 256v896h1280V256zm256 1024v128h1280V512h-128v768zm1536 384V768h-128v768H640v128z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`${addCollec ? 'block' : 'hidden'} bg-black/80 absolute inset-0 z-10`} />
            {addCollec && (
                <section className="absolute rounded-xl z-10 p-2 lg:space-y-4 space-x-2 lg:w-[50vw] w-[90vw] flex flex-col gap-4 border border-white shadow-2xl bg-[#191B1D] top-1/2 -translate-y-full lg:-translate-y-1/2 left-1/2 -translate-x-1/2">
                    <div className="flex justify-between items-center">
                        <div className="Digital-Heading text-xl  lg:text-3xl flex-1 px-2">
                            {content.createCate}
                        </div>
                        <div className="w-10">
                            <button type="button" onClick={toggleAddCollec} className=" lg:hover:bg-white/20 transform-all duration-300 ease-out p-2 rounded-md"><svg width="30" height="30" viewBox="0 0 24 24"><path fill="white" d="M7.4 6L6 7.4L10.6 12L6 16.6L7.4 18L12 13.4L16.6 18L18 16.6L13.4 12L18 7.4L16.6 6L12 10.6Z" /></svg></button>
                        </div>
                    </div>
                    {err && <div className="text-red-500 text-sm">{err}</div>}
                    <div className="flex flex-col gap-4">
                        <div className="rounded-xl mx-auto border-[2px] border-gray-800">
                            <img src={artwork?.media_url} className="max-w-64 max-h-36 object-cover rounded-xl" />
                        </div>
                        <form className="flex flex-col gap-4" onSubmit={handleCreateAndAdd}>
                            <input value={newCollecName} onChange={(e) => setNewCollecName(e.target.value)} type="text" placeholder={input.collecName} className="Digital-Login-Input" />
                            <div className="flex justify-between">
                                <div className="">
                                    <div className="Digital-Text1">
                                        {content.private}
                                    </div>
                                    <div className="Digital-Text1 text-xs">
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
                            <button type="submit" disabled={!newCollecName.trim() || loading} className={`w-full p-2 Digital-Text1 text-center rounded-md transition-colors duration-200 ${!newCollecName.trim() || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#ffffff] lg:hover:bg-[#E0E0E0] text-black'}`}>{loading ? button.creating : button.create}</button>
                        </form>
                    </div>
                </section>
            )}
        </div>
    )

}