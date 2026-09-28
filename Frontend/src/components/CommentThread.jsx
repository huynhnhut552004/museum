import { useState, useEffect } from "react";
import commentApi from "../api/commentApi";

export default function CommentThread({ rootComment, artworkId, eventId, currentUserId, currentUserRole, onDeleteRoot, onLikeRoot, socket, lang, type, style }) {
    const [replies, setReplies] = useState([]);
    const [showReplies, setShowReplies] = useState(false);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyWrite, setReplyWrite] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!socket) return;
        const handleNewComment = async (data) => {
            if (data.comment?.parent_id === rootComment.id && showReplies) {
                try {
                    const res = await commentApi.getRep(rootComment.id);
                    setReplies(res?.data?.data || res?.data || []);
                } catch (error) { }
            }
        };
        const handleUpdateLike = (data) => {
            const { commentId, newLikeCount } = data;
            setReplies(prev => prev.map(r => r.id === commentId ? { ...r, like_count: newLikeCount } : r));
        };
        const handleDeleteComment = (data) => {
            setReplies(prev => prev.filter(r => r.id !== data.commentId));
        };
        socket.on("new_comment_realtime", handleNewComment);
        socket.on("update_like_realtime", handleUpdateLike);
        socket.on("delete_comment_realtime", handleDeleteComment);
        return () => {
            socket.off("new_comment_realtime", handleNewComment);
            socket.off("update_like_realtime", handleUpdateLike);
            socket.off("delete_comment_realtime", handleDeleteComment);
        };
    }, [socket, rootComment.id, showReplies]);

    const toggleReplies = async () => {
        if (!showReplies) {
            if (replies.length === 0) {
                setLoadingReplies(true);
                try {
                    const res = await commentApi.getRep(rootComment.id);
                    setReplies(res?.data?.data || res?.data || []);
                } catch (error) {
                } finally {
                    setLoadingReplies(false);
                }
            }
            setShowReplies(true);
        } else {
            setShowReplies(false);
        }
    };

    const handleOpenReply = (targetComment) => {
        setReplyingTo(targetComment);
        const isTargetAdmin = targetComment.role === 'admin';
        if (targetComment.id !== rootComment.id) {
            const displayName = isTargetAdmin ? lang === "vi" ? "Quản trị" : "Admin" : targetComment.full_name;
            setReplyWrite(`@${displayName} `);
        } else {
            setReplyWrite(isTargetAdmin ? lang === "vi" ? "@Quản trị" : "@Admin" : "");
        }
    };

    const submitReply = async (e) => {
        e.preventDefault();
        if (!replyWrite.trim()) return;

        setIsSubmitting(true);
        try {
            if (artworkId && !eventId) {
                await commentApi.createArtwork(artworkId, replyWrite, rootComment.id);
                setReplyWrite("");
                setReplyingTo(null);
                const res = await commentApi.getRep(rootComment.id);
                setReplies(res?.data?.data || res?.data || []);
                setShowReplies(true);
            } else {
                await commentApi.createEvent(eventId, replyWrite, rootComment.id);
                setReplyWrite("");
                setReplyingTo(null);
                const res = await commentApi.getRep(rootComment.id);
                setReplies(res?.data?.data || res?.data || []);
                setShowReplies(true);
            }
        } catch (error) {
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteReply = async (replyId) => {
        const previousReplies = [...replies];
        setReplies(prev => prev.filter(r => r.id !== replyId));
        try {
            if (artworkId && !eventId) {
                await commentApi.delete(replyId, { artworkId: artworkId });
            } else {
                await commentApi.delete(replyId, { eventId: eventId });
            }
        } catch (error) {
            setReplies(previousReplies);
        }
    };

    const handleLikeReply = async (replyId) => {
        setReplies(prev => prev.map(r => {
            if (r.id === replyId) {
                const isLiked = r.is_liked_by_me;
                return {
                    ...r,
                    is_liked_by_me: !isLiked,
                    like_count: isLiked ? Number(r.like_count) - 1 : Number(r.like_count) + 1
                };
            }
            return r;
        }));

        try {
            if (artworkId && !eventId) {
                const res = await commentApi.likeComment(replyId, { artworkId: artworkId });
                if (res?.data) {
                    setReplies(prev => prev.map(r => {
                        if (r.id === replyId) {
                            return { ...r, is_liked_by_me: res.data.is_liked, like_count: res.data.like_count };
                        }
                        return r;
                    }));
                }
            } else {
                const res = await commentApi.likeComment(replyId, { eventId: eventId });
                if (res?.data) {
                    setReplies(prev => prev.map(r => {
                        if (r.id === replyId) {
                            return { ...r, is_liked_by_me: res.data.is_liked, like_count: res.data.like_count };
                        }
                        return r;
                    }));
                }
            }
        } catch (error) {
            setReplies(prev => prev.map(r => {
                if (r.id === replyId) {
                    const isLiked = r.is_liked_by_me;
                    return {
                        ...r,
                        is_liked_by_me: !isLiked,
                        like_count: isLiked ? Number(r.like_count) - 1 : Number(r.like_count) + 1
                    };
                }
                return r;
            }));
        }
    };

    const timeAgo = (dateInput) => {
        const now = new Date();
        const past = new Date(dateInput);
        const diffInMs = now - past;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        if (diffInDays < 1) {
            return "Hôm nay";
        } else if (diffInDays < 30) {
            return `${diffInDays} ${lang === "vi" ? 'ngày trước' : 'days ago'}`;
        } else if (diffInDays < 365) {
            const months = Math.floor(diffInDays / 30);
            return `${months} ${lang === "vi" ? "tháng trước" : "months ago"}`;
        } else {
            const years = Math.floor(diffInDays / 365);
            return `${years} ${lang === "vi" ? "năm trước" : "years ago"}`;
        }
    };


    return (
        <div className="flex flex-col gap-2 p-4 border-b border-gray-800 rounded-xl h-full">
            <div className="flex gap-2 items-center">
                <div className={`${style.text1}`}>
                    {rootComment.role === 'admin' ? (
                        <span className={`${style.text1} flex justify-center items-center gap-1 `}>{lang === "vi" ? "Quản trị" : "Admin"} <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="#2196F3" d="M12 23C6.443 21.765 2 16.522 2 11V5l10-4l10 4v6c0 5.524-4.443 10.765-10 12M4 6v5a10.58 10.58 0 0 0 8 10a10.58 10.58 0 0 0 8-10V6l-8-3Z" /><circle cx="12" cy="8.5" r="2.5" fill="#2196F3" /><path fill="#2196F3" d="M7 15a5.78 5.78 0 0 0 5 3a5.78 5.78 0 0 0 5-3c-.025-1.896-3.342-3-5-3c-1.667 0-4.975 1.104-5 3" /></svg></span>
                    ) : (
                        `@${rootComment.full_name}`
                    )}
                </div>
                <div className={`${style.text1} text-gray-400 text-sm`}>{timeAgo(rootComment.created_at)}</div>
            </div>
            <div className={`pl-6 ${style.text2}`}>{rootComment.content}</div>
            <div className="flex justify-between items-center px-2 pl-4 mt-1">
                <div className="flex gap-2 items-center">
                    <button type="button" onClick={() => onLikeRoot(rootComment.id)} className={`${type === 'classic' ? "lg:hover:bg-black/20" : "lg:hover:bg-white/20"} p-2 rounded-full flex items-center gap-1 transition-colors`}>
                        {rootComment.is_liked_by_me ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#007dff" d="M4 21h1V8H4c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2M20 8h-6.61l1.12-3.37c.2-.61.1-1.28-.27-1.8c-.38-.52-.98-.83-1.62-.83h-.61c-.3 0-.58.13-.77.36L7.01 7.44V21h10.31a2 2 0 0 0 1.87-1.3l2.76-7.35c.04-.11.06-.23.06-.35v-2c0-1.1-.9-2-2-2Z" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill={style.like} d="M20 8h-5.61l1.12-3.37c.2-.61.1-1.28-.27-1.8c-.38-.52-.98-.83-1.62-.83h-1.61c-.3 0-.58.13-.77.36L6.54 8H4.01c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h13.31a2 2 0 0 0 1.87-1.3l2.76-7.35c.04-.11.06-.23.06-.35v-2c0-1.1-.9-2-2-2ZM6 19H4v-9h2zm14-7.18L17.31 19H8V9.36L12.47 4h1.15l-1.56 4.68a1.01 1.01 0 0 0 .95 1.32h7v1.82Z" /></svg>
                        )}
                        <span className={`text-sm font-medium ${style.text1}`}>{rootComment.like_count > 0 ? rootComment.like_count : ''}</span>
                    </button>
                    <button type="button" onClick={() => handleOpenReply(rootComment)} className={`${type === 'classic' ? "lg:hover:bg-black/20" : "lg:hover:bg-white/20"} p-2 rounded-full ${style.text1} text-base`}>
                        {lang === "vi" ? "Phản hồi" : "Reply"}
                    </button>
                </div>
                {(rootComment.user_id === currentUserId || currentUserRole === 'admin') && (
                    <button type="button" onClick={() => onDeleteRoot(rootComment.id)} className={`lg:hover:bg-red-500 lg:hover:text-white ${style.text1} p-2 px-4 rounded-full text-base transition-colors`}>
                        {lang === "vi" ? "Xoá" : "Delete"}
                    </button>
                )}
            </div>
            {replyingTo && (
                <form className="pl-6 mt-2 pb-2" onSubmit={submitReply}>
                    <div className="flex flex-col items-end gap-2">
                        <div className="w-full">
                            <input type="text" autoFocus value={replyWrite} onChange={(e) => setReplyWrite(e.target.value)} placeholder={`${lang === "vi" ? "Phản hồi" : "Reply"} ${replyingTo.role === 'admin' ? lang === "vi" ? "Quản trị" : "Admin" : '@' + replyingTo.full_name}...`} className={`bg-inherit w-full border-b border-gray-600 focus:outline-none focus:border-b-[2px] ${style.text2}`} />
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button type="button" onClick={() => setReplyingTo(null)} className={`p-1 ${style.text1} ${type === 'classic' ? "lg:hover:bg-black/20" : "lg:hover:bg-white/20"} rounded-full px-4 text-sm`}>{lang === "vi" ? "Huỷ" : "Cancel"}</button>
                            <button type="submit" disabled={!replyWrite.trim() || isSubmitting} className={`p-1 ${style.text1} ${!replyWrite.trim() || isSubmitting ? "text-white bg-gray-400 cursor-not-allowed" : type === "classic" ? "text-white bg-[#0F3A32]" : "text-black bg-white/90"} rounded-full px-4 text-sm`}>
                                {isSubmitting ? '...' : 'Gửi'}
                            </button>
                        </div>
                    </div>
                </form>
            )}
            {rootComment.reply_count > 0 && (
                <div className="pl-6 mt-1">
                    <button onClick={toggleReplies} className={`flex items-center gap-2 ${style.text2} ${type === 'classic' ? "lg:hover:bg-black/20" : "lg:hover:bg-white/20"} px-3 py-1 rounded-full transition-colors`}>
                        {showReplies ? (
                            <>{lang === "vi" ? "Ẩn" : "Hide"} {rootComment.reply_count} {lang === "vi" ? "Phản hồi" : "Reply"} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="m12 10.8l-4.6 4.6L6 14l6-6l6 6l-1.4 1.4z" /></svg></>
                        ) : (
                            <>{rootComment.reply_count} {lang === "vi" ? "Phản hồi" : "Reply"} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M7.4 8l4.6 4.6L16.6 8L18 9.4l-6 6l-6-6z" /></svg></>
                        )}
                    </button>
                </div>
            )}
            {showReplies && (
                <div className="pl-10 mt-3 flex flex-col gap-4 border-l-2 border-gray-400 ml-4 overflow-y-auto min-h-0 no-scrollbar">
                    {loadingReplies ? (
                        <div className={style.text1}>{lang === "vi" ? "Đang tải..." : "Loading..."}</div>
                    ) : (
                        replies.map((reply) => (
                            <div key={reply.id} className="flex flex-col gap-1">
                                <div className="flex gap-2 items-center">
                                    <div className={`${style.text2}`}>@{reply.full_name}</div>
                                    <div className={`${style.text1} text-gray-400 text-sm`}>{timeAgo(reply.created_at)}</div>
                                </div>
                                <div className={style.text2}>{reply.content}</div>
                                <div className="flex justify-between items-center pr-2 mt-1">
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => handleLikeReply(reply.id)} className="hover:bg-black/10 p-1.5 rounded-full flex items-center gap-1 transition-colors">
                                            {reply.is_liked_by_me ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="#007dff" d="M4 21h1V8H4c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2M20 8h-6.61l1.12-3.37c.2-.61.1-1.28-.27-1.8c-.38-.52-.98-.83-1.62-.83h-.61c-.3 0-.58.13-.77.36L7.01 7.44V21h10.31a2 2 0 0 0 1.87-1.3l2.76-7.35c.04-.11.06-.23.06-.35v-2c0-1.1-.9-2-2-2Z" /></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill={style.like} d="M20 8h-5.61l1.12-3.37c.2-.61.1-1.28-.27-1.8c-.38-.52-.98-.83-1.62-.83h-1.61c-.3 0-.58.13-.77.36L6.54 8H4.01c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h13.31a2 2 0 0 0 1.87-1.3l2.76-7.35c.04-.11.06-.23.06-.35v-2c0-1.1-.9-2-2-2ZM6 19H4v-9h2zm14-7.18L17.31 19H8V9.36L12.47 4h1.15l-1.56 4.68a1.01 1.01 0 0 0 .95 1.32h7v1.82Z" /></svg>
                                            )}
                                            <span className={`text-xs font-medium ${style.text1}`}>{reply.like_count > 0 ? reply.like_count : ''}</span>
                                        </button>
                                        <button type="button" onClick={() => handleOpenReply(reply)} className={`${style.text2} hover:text-black ${type === 'classic' ? "lg:hover:bg-black/20" : "lg:hover:bg-white/20"} px-2 py-1.5 rounded-full transition-colors`}>
                                            {lang === "vi" ? "Phản hồi" : "Reply"}
                                        </button>
                                    </div>
                                    {(reply.user_id === currentUserId || currentUserRole === 'admin') && (
                                        <button type="button" onClick={() => handleDeleteReply(reply.id)} className="text-xs font-medium text-red-500 hover:bg-red-50 px-2 py-1.5 rounded-full transition-colors">
                                            {lang === "vi" ? "Xoá" : "Delete"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}