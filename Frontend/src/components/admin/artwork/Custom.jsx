import ErrorNoti from "../../comon/Noti/Error";
import SuccessNoti from "../../comon/Noti/Success";
import WarningNoti from "../../comon/Noti/Warning";
import artworkApi from "../../../api/artworkApi";
import userApi from "../../../api/userApi";
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from "react";

export default function CustomArtworkLayout() {
    const fileInputRef = useRef(null);
    const [err, setErr] = useState('');
    const [succ, setSucc] = useState('');
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [errFile, setErrFile] = useState('');
    const [email, setEmail] = useState('');
    const [errUser, setErrUser] = useState('');
    const [warnBan, setWarnBan] = useState('');
    const [hasUser, setHasUser] = useState(false);
    const [isVideo, setIsVideo] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [errGetId, setErrGetId] = useState('');
    const [deleted, setDeleted] = useState(false);
    const [succPopup, setSuccPopup] = useState('');
    const [errPopup, setErrPopup] = useState('');
    const [succRetryAI, setSuccRetryAI] = useState(null);
    const [form, setForm] = useState({
        title: "", slug: "", artist_id: "", artist_tag: "", status: "published",
        artist_display_name: "", year: "", layout_type: "",
        description: "", description_en: "", title_en: "", attributes_text: ""
    });
    const [loadAI, setLoadAI] = useState(false);
    const [errAI, setErrAI] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) getArtworkById(id);
    }, [id]);

    useEffect(() => {
        return () => {
            if (previewUrl && !previewUrl.startsWith('http')) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const getArtworkById = async (artworkId) => {
        if (!artworkId) return;
        try {
            const res = await artworkApi.getById(artworkId);
            const data = res.data;
            let displayName = data.artist_display_name || "";
            let tag = "";
            if (displayName.includes(' #')) {
                const parts = displayName.split(' #');
                tag = parts.pop();
                displayName = parts.join(' #');
            }
            setForm({
                title: data.title || "",
                slug: data.slug || "",
                title_en: data.title_en || "",
                artist_id: data.artist_id || null,
                artist_display_name: displayName,
                artist_tag: tag,
                description: data.description || "",
                description_en: data.description_en || "",
                year: data.year || "",
                layout_type: data.layout_type || "",
                status: data.status || "published",
                attributes_text: data.attributes_text || "",
            });
            if (data.media_url) {
                setPreviewUrl(data.media_url);
                setIsVideo(data.media_url.match(/\.(mp4|mov|webm)$/i) ? true : false);
            }
            if (data.artist_id) setHasUser(true);
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    setErrGetId('Đăng nhập hết hạn, vui lòng đăng nhập lại!');
                } else if (error.response.status === 404) {
                    setErrGetId('Tác phẩm không tồn tại!');
                }
            } else if (error.request) {
                setErrGetId('Lỗi lấy tác phẩm, thử lại sau!');
            } else {
                setErrGetId('Lỗi kết nối server!');
            }
        }
    };

    const retryAI = async (e) => {
        e.preventDefault();
        setLoadAI(true);
        setErrAI(null);
        setSuccRetryAI(null)
        if (!id) {
            setLoadAI(false);
            return;
        }
        try {
            await artworkApi.retryAI(id, previewUrl, form.title, form.artist_display_name, form.layout_type, form.artist_id, form.description);
            setSuccRetryAI('Đã gửi yêu cầu xử lý lại, vui lòng đợi kết quả.');
            setTimeout(() => {
                setSuccRetryAI(null);
            }, 4000);
        } catch (error) {
            setErrAI('Có lỗi xảy ra, thử lại sau!');
        } finally {
            setLoadAI(false);
        }
    };

    const emailOnchange = (e) => {
        const value = e.target.value;
        setEmail(value);
        if (value.trim() === '') {
            setHasUser(false);
            setForm((prev) => ({
                ...prev,
                artist_display_name: "",
                artist_tag: "",
                artist_id: ""
            }));
            setErrUser('');
        }
    };

    const handleOnchange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClearUser = () => {
        setHasUser(false);
        setEmail('');
        setErrUser('');
        setWarnBan('');
        setForm(prev => ({
            ...prev,
            artist_id: null,
            artist_tag: "",
            artist_display_name: ""
        }));
    };

    const getUserByEmail = async (email) => {
        if (!email) return;
        setErrUser('');
        setWarnBan('');
        try {
            const res = await userApi.getByEmail(email);
            const data = res.data.data;
            if (data.is_banned === true) setWarnBan('Người dùng này hiện đang bị chặn!');
            setForm((prev) => ({
                ...prev,
                artist_display_name: data.full_name,
                artist_tag: data.user_tag,
                artist_id: data.id
            }));
            setHasUser(true);
        } catch (error) {
            setHasUser(false);
            setForm((prev) => ({
                ...prev,
                artist_display_name: "",
                artist_tag: "",
                artist_id: ""
            }));
            if (error.response) {
                if (error.response.status === 404) setErrUser('Không tìm thấy người dùng')
            } else if (error.request) {
                setErrUser('Lỗi tìm kiếm người dùng, hãy thử lại!');
            } else {
                setErrUser("Lỗi kết nối server!");
            }
        }
    };

    const handleProcessFile = (selectedFile) => {
        if (!selectedFile) return;
        if (selectedFile.size > 50 * 1024 * 1024) {
            setErrFile("File quá lớn! Vui lòng chọn file dưới 50MB!");
            return;
        }
        setFile(selectedFile);
        setErrFile('');
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
        setIsVideo(selectedFile.type.startsWith('video/'));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        handleProcessFile(droppedFile);
    };

    const handleClickBox = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        handleProcessFile(selectedFile);
    };

    const handleSubmitUser = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            getUserByEmail(email);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!form.title || !form.artist_display_name) {
            setErr("Vui lòng nhập đủ dữ liệu (Tên tác phẩm, Tác giả)!");
            return;
        }
        setSucc('');
        setErr('');
        setLoading(true);
        const payload = new FormData();
        let artistName;
        if (form.artist_id) {
            artistName = `${form.artist_display_name} #${form.artist_tag}`;
        } else {
            artistName = form.artist_display_name;
        }
        if (file) {
            payload.append('image', file);
        }
        payload.append('title', form.title);
        payload.append('slug', form.slug);
        payload.append('artist_id', form.artist_id || "");
        payload.append('artist_display_name', artistName);
        if (form.year) payload.append('year', form.year);
        payload.append('layout_type', form.layout_type);
        payload.append('title_en', form.title_en);
        payload.append('description', form.description);
        payload.append('description_en', form.description_en);
        payload.append('attributes_text', form.attributes_text);
        if (id) payload.append('status', form.status);
        try {
            if (id) {
                await artworkApi.update(id, payload);
                setSucc('Cập nhật thành công.');
            } else {
                if (!file) {
                    setErr("Vui lòng chọn hoặc kéo thả ảnh/video!");
                    return;
                }
                await artworkApi.create(payload);
                setSucc('Đang đợi AI.');
                setFile(null);
                setForm({ title: "", slug: "", artist_id: "", artist_display_name: "", artist_tag: "", year: "", layout_type: "", description: "", description_en: "", title_en: "", attributes_text: "" });
                setEmail('');
                setHasUser(false);
                setErr('');
                setErrUser('');
                setWarnBan('');
                setErrFile('');
                setPreviewUrl('');
                setTimeout(() => {
                    setSucc('');
                }, 2000);
            }
        } catch (error) {
            if (error.request) {
                setErr('Đã có lỗi xảy ra, vui lòng thử lại sau!');
            } else {
                setErr('Lỗi kết nối đến sever!');
            }
        } finally {
            setLoading(false);
        }
    };

    const Delete = async (id) => {
        if (!id) return;
        setLoading(true);
        setErrPopup('');
        setSuccPopup('');
        try {
            await artworkApi.delete(id);
            setSuccPopup('Xoá thành công!');
            setTimeout(() => {
                navigate('/admin/artwork')
            }, 2000);
        } catch (error) {
            if (error.request) {
                setErrPopup('Lỗi hệ thống!');
            } else {
                setErrPopup('Không thể kết nối sever!');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="h-full max-w-[96%] mx-auto flex flex-col justify-center">
            <div className="">
                <div className="">
                    <Link to="/admin/artwork/" className="flex heading-body items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="black" d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42a.996.996 0 0 0-1.41 0l-6.59 6.59a.996.996 0 0 0 0 1.41l6.59 6.59a.996.996 0 1 0 1.41-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1" /></svg>
                        Trở về
                    </Link>
                </div>
                <div className="flex justify-between">
                    <div className="heading text-black p-2">{id ? "Cập nhật tác phẩm" : "Thêm tác phẩm mới"}</div>
                    {id && (
                        <div>
                            <div className="flex gap-4">
                                <div className="heading text-red-600 text-right text-base">{form.status === 'draft' ? "Tác phẩm xử lý AI thất bại!" : ""}</div>
                                {form.status === "draft" && (
                                    <button onClick={retryAI} disabled={loadAI} className="admin-confirm-button flex justify-center items-center w-14 h-14">{loadAI ?
                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="2" d="M12 6.99998C9.1747 6.99987 6.99997 9.24998 7 12C7.00003 14.55 9.02119 17 12 17C14.7712 17 17 14.75 17 12"><animateTransform attributeName="transform" attributeType="XML" dur="560ms" from="0,12,12" repeatCount="indefinite" to="360,12,12" type="rotate" /></path></svg>
                                        : <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m15.167 1l.598 1.118c.404.755.606 1.133.472 1.295c-.133.162-.573.031-1.454-.23A9.8 9.8 0 0 0 12 2.78c-5.247 0-9.5 4.128-9.5 9.22a8.97 8.97 0 0 0 1.27 4.61M8.834 23l-.598-1.118c-.404-.756-.606-1.134-.472-1.295c.133-.162.573-.032 1.454.23c.88.261 1.815.402 2.783.402c5.247 0 9.5-4.128 9.5-9.22a8.97 8.97 0 0 0-1.27-4.609" /></svg>}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="pb-2">
                    {succRetryAI && (<SuccessNoti succ={succRetryAI} />)}
                    {errAI && (<ErrorNoti err={errAI} />)}
                    {errGetId && (<ErrorNoti err={errGetId} />)}
                </div>
            </div>
            <form onSubmit={handleSubmit} className="border overflow-y-auto border-gray-800 bg-gray-200 p-2 rounded w-full lg:h-[80vh] h-[70vh] space-y-4 flex flex-col justify-around">
                <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="heading-body">Tên tác phẩm</label>
                        <input spellCheck={false} lang="vi" type="text" name="title" value={form.title} onChange={handleOnchange} className="Digital-Login-Input" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="heading-body">Đường dẫn</label>
                        <input spellCheck={false} lang="vi" type="text" name="slug" value={form.slug} onChange={handleOnchange} className="Digital-Login-Input" />
                    </div>
                </div>
                {id && (
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="heading-body">Tên tác phẩm (EN)</label>
                            <input spellCheck={false} lang="en" type="text" name="title_en" value={form.title_en} onChange={handleOnchange} className="Digital-Login-Input w-full" />
                        </div>
                        <div className="flex-1 flex flex-col">
                            <label className="heading-body">Trạng thái</label>
                            <select name="status" value={form.status} onChange={handleOnchange} className="admin-select">
                                <option value="published">Công khai</option>
                                <option value="draft">Bản nháp</option>
                                <option value="hidden">Ẩn</option>
                            </select>
                        </div>
                    </div>
                )}
                <div className="flex justify-center items-start gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="heading-body">Email</label>
                        <div onKeyDown={handleSubmitUser} className="flex relative">
                            <button type="button" onClick={() => getUserByEmail(email)} className="admin-button-search">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#fff" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14" /></svg>
                            </button>
                            <input spellCheck={false} type="email" name="email" value={email} onChange={emailOnchange} className="Digital-Login-Input" />
                        </div>
                        <div className="w-full text-sm">
                            {errUser && <ErrorNoti err={errUser} />}
                            {warnBan && <WarningNoti warn={warnBan} />}
                        </div>
                    </div>
                    <div className={`flex-1 ${hasUser ? "flex" : undefined} gap-2 justify-center items-end`}>
                        <div className="space-y-2">
                            <label className="heading-body">Tên tác giả</label>
                            <input spellCheck={false} type="text" disabled={hasUser} name="artist_display_name" value={`${form.artist_display_name}${form.artist_tag ? ` #${form.artist_tag}` : ''}`} onChange={handleOnchange} className={`Digital-Login-Input ${hasUser ? "opacity-60 cursor-not-allowed" : ""}`} />
                        </div>
                        {hasUser && (
                            <div className="lg:w-[36%]">
                                <button type="button" onClick={handleClearUser} className="admin-confirm-button px-6 bg-red-600 lg:block hidden">
                                    Hủy liên kết
                                </button>
                                <button type="button" onClick={handleClearUser} className="admin-confirm-button p-3 bg-red-600 lg:hidden block">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><path fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" d="m13.5.5l-13 13m0-13l13 13" stroke-width="1" /></svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex justify-center items-start gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="heading-body">Năm vẽ</label>
                        <input spellCheck={false} type="text" name="year" value={form.year} onChange={handleOnchange} className="Digital-Login-Input" />
                    </div>
                    <div className="flex-1 flex flex-col">
                        <label className="heading-body">Loại Layout</label>
                        <select name='layout_type' value={form.layout_type} onChange={handleOnchange} className='admin-select'>
                            <option value="classic">Truyền thống</option>
                            <option value="digital">Kỹ thuật số</option>
                            <option value="both">Cả hai</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="heading-body">Ảnh hoặc video tác phẩm</div>
                    <div onClick={handleClickBox} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 bg-white ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}>
                        {previewUrl ? (
                            <div className="text-center w-full">
                                {isVideo ? (
                                    <video src={previewUrl} controls className="mx-auto max-h-[300px] rounded border border-gray-200" />
                                ) : (
                                    <img src={previewUrl} alt="Preview" className="mx-auto max-h-[300px] object-contain rounded shadow-sm border border-gray-200" />
                                )}
                                <div className="text-sm text-blue-600 mt-2 font-medium hover:underline">
                                    Nhấn hoặc kéo thả file khác để thay thế
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="text-base text-gray-700 text">
                                    Nhấn để chọn ảnh/video hoặc kéo thả vào đây
                                </div>
                                <div className="text-xs text text-gray-400 mt-2">
                                    Hỗ trợ JPG, PNG, MP4, MOV... (Tối đa 50MB)
                                </div>
                            </div>
                        )}
                        <input spellCheck={false} type="file" ref={fileInputRef} accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
                    </div>
                    {errFile && <div className="mt-1"><ErrorNoti err={errFile} /></div>}
                </div>
                <div className="space-y-2">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="heading-body">Mô tả (VI)</label>
                            <textarea name="description" lang="vi" spellCheck={false} value={form.description} onChange={handleOnchange} className="Digital-Login-Input resize-none h-[200px] no-scrollbar" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="heading-body">Mô tả (EN)</label>
                            <textarea name="description_en" lang="en" spellCheck={false} value={form.description_en} onChange={handleOnchange} className="Digital-Login-Input resize-none h-[200px] no-scrollbar" />
                        </div>
                    </div>
                    <div className="space-y-2 pt-4">
                        <label className="heading-body">Các thuộc tính mở rộng</label>
                        <div className="text-xs text-gray-500 text">
                            <strong>Cách nhập:</strong> Nhập các giá trị, phân cách bằng dấu <strong>";"</strong>. Có thể xuống dòng tuỳ ý.
                        </div>
                        <textarea lang="vi" spellCheck={false} name="attributes_text" value={form.attributes_text} onChange={handleOnchange} className="Digital-Login-Input resize-none h-[250px] no-scrollbar" />
                    </div>
                </div>
                <div className="flex gap-2 pt-4">
                    <div className="flex-1 text">
                        {err && (
                            <ErrorNoti err={err} />
                        )}
                        {succ && (
                            <SuccessNoti succ={succ} />
                        )}
                    </div>
                    <div className="flex justify-end lg:gap-2 gap-4 items-center lg:w-[30%]">
                        <div className="">
                            <button type="submit" disabled={loading} className="admin-confirm-button">Xác nhận</button>
                        </div>
                        <div className={id ? "block" : "hidden"}>
                            <button type="button" onClick={() => setDeleted(true)} className="admin-confirm-button px-6 bg-red-600">Xoá</button>
                        </div>
                    </div>
                </div>
            </form>
            {deleted && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="bg-black/70 backdrop-blur-sm absolute inset-0" onClick={() => setDeleted(false)} />
                    <div className="bg-white flex flex-col justify-between rounded-lg shadow-xl space-y-6 p-6 relative z-10 w-[90vw] lg:w-[25vw]">
                        <div className="text-center mt-2">
                            <div className="heading-body">Có chắc muốn xoá tác phẩm này?</div>
                            <div className="heading-body font-bold text-center text-base text-red-600">"{form.title}"</div>
                        </div>
                        <div className="flex gap-3 items-center justify-center w-full">
                            <button type="button" disabled={loading} className="admin-confirm-button bg-gray-400 flex-1 text-center" onClick={() => setDeleted(false)}>
                                Hủy bỏ
                            </button>
                            <button type="button" disabled={loading} className="admin-confirm-button bg-red-600 flex-1 text-center" onClick={() => { Delete(id) }}>
                                Xóa
                            </button>
                        </div>
                        <div className="w-full text-sm">
                            {errPopup && <ErrorNoti err={errPopup} />}
                            {succPopup && <SuccessNoti succ={succPopup} />}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}