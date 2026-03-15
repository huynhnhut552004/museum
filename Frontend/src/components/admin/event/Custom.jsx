import ErrorNoti from "../../comon/Noti/Error";
import SuccessNoti from "../../comon/Noti/Success";
import eventApi from "../../../api/eventApi";
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from "react";

export default function CustomEventkLayout() {
    const [getId, setGetId] = useState('');
    const [errGetSlug, setErrGetSlug] = useState('');
    const [err, setErr] = useState('');
    const [succ, setSucc] = useState('');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ title: "", slug: "", description: "", content: "", start_time: "", end_time: "" });
    const [deleted, setDeleted] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isVideo, setIsVideo] = useState(false);
    const [file, setFile] = useState(null);
    const [errFile, setErrFile] = useState('');
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const [succPopup, setSuccPopup] = useState('');
    const [errPopup, setErrPopup] = useState('');
    const { slug } = useParams();
    const navigate = useNavigate();

    const getEventBySlug= async (EventSlug) => {
        if (!EventSlug) return;
        setLoading(true);
        setErrGetSlug('');
        try {
            const res = await eventApi.getBySlug(EventSlug);
            const data = res.data.data;
            setGetId(data.id);
            const formatForInput = (isoString) => {
                if (!isoString) return "";
                return isoString.substring(0, 16);
            };
            setForm({ title: data.title, slug: data.slug, description: data.description, content: data.content, start_time: formatForInput(data.start_time), end_time: formatForInput(data.end_time) });
            if (data.banner_url) {
                setPreviewUrl(data.banner_url);
                setIsVideo(data.banner_url.match(/\.(mp4|mov|webm)$/i) ? true : false);
            }
        }catch (error){
            if (error.response){
                if(error.response.status === 400) setErrGetSlug('Thiếu dữ liệu, thử lại sau!');
                if(error.response.status === 404) setErrGetSlug('Không tìm thấy sự kiện!');
            } else if (error.request){
                setErrGetSlug('Lỗi tìm kiếm sự kiện, vui lòng thử lại!');
            } else {
                setErrGetSlug('Lỗi server, thử lại sau!');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(()=>{
        getEventBySlug(slug);
    },[slug]);

    useEffect(() => {
        return () => {
            if (previewUrl && !previewUrl.startsWith('http')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleOnchange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
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

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!form.title || !form.description || !form.content || !form.start_time || !form.end_time) {
            setErr("Vui lòng nhập đủ dữ liệu!");
            return;
        }
        setSucc('');
        setErr('');
        setLoading(true);
        const payload = new FormData();
        if (file) {
            payload.append('image', file);
        }
        payload.append('title', form.title);
        payload.append('slug', form.slug);
        payload.append('description', form.description);
        payload.append('content', form.content);
        payload.append('start_time', form.start_time);
        payload.append('end_time', form.end_time);
        try {
            if (slug) {
                await eventApi.update(getId, payload);
                setSucc('Cập nhật thành công!');
            } else {
                if(!file){
                    setErr("Chưa chọn ảnh hoặc video!")
                }
                await eventApi.create(payload);
                setSucc('Tạo sự kiện thành công!');
                setFile(null);
                setForm({ title: "", slug: "", description: "", content: "", start_time: "", end_time: "" });
                setPreviewUrl('');
                setErr('');
                setErrFile('');
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
            await eventApi.delete(id);
            setSuccPopup('Xoá thành công!');
            setTimeout(() => {
                navigate('/admin/event')
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
                    <Link to="/admin/event/" className="flex heading-body items-center"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="black" d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42a.996.996 0 0 0-1.41 0l-6.59 6.59a.996.996 0 0 0 0 1.41l6.59 6.59a.996.996 0 1 0 1.41-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1" /></svg>Trở về</Link>
                </div>
                <div className={`heading text-black p-2 ${slug ? "hidden" : "block"}`}>Thêm sự kiện</div>
                <div className={`heading text-black p-2 ${slug ? "block" : "hidden"}`}>Cập nhật sự kiện</div>
                {errGetSlug && (<ErrorNoti err={errGetSlug} />)}
            </div>
            <form onSubmit={handleSubmit} className="border overflow-y-auto border-gray-800 bg-gray-200 p-2 rounded-md w-full lg:h-[80vh] h-[70vh] space-y-4 flex flex-col justify-around">
                <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                        <label className="heading-body">Tên sự kiện</label>
                        <input type="text" name="title" value={form.title} onChange={handleOnchange} className="Digital-Login-Input" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="heading-body">Slug</label>
                        <input type="text" name="slug" value={form.slug} onChange={handleOnchange} className="Digital-Login-Input" />
                    </div>
                </div>
                <div className="">
                    <div className="heading-body">Ảnh hoặc video</div>
                    <div onClick={handleClickBox} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 mb-5 ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                        {previewUrl ? (
                            <div className="text-center w-full">
                                {isVideo ? (
                                    <video src={previewUrl} controls className="mx-auto max-h-[250px] rounded-md shadow-sm border" />
                                ) : (
                                    <img src={previewUrl} alt="Preview" className="mx-auto max-h-[250px] object-contain rounded-md shadow-sm border" />
                                )}
                                <div className="text-sm text-blue-500 mt-3 font-medium hover:underline">
                                    Nhấn hoặc kéo thả file khác để thay đổi
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="text-base text-gray-700">
                                    Nhấn để chọn ảnh/video hoặc kéo thả vào đây
                                </div>
                                <div className="text-xs text-gray-400 mt-2">
                                    Hỗ trợ JPG, PNG, MP4, MOV... (Tối đa 50MB)
                                </div>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
                    </div>
                    <div className="w-full">{errFile && (<ErrorNoti err={errFile} />)}</div>
                </div>
                <div className="space-y-2">
                    <label className="heading-body">Mô tả</label>
                    <textarea type="text" name="description" value={form.description} onChange={handleOnchange} className="Digital-Login-Input h-[200px]" />
                </div>
                <div className="space-y-2">
                    <label className="heading-body">Nội dung</label>
                    <textarea type="text" name="content" value={form.content} onChange={handleOnchange} className="Digital-Login-Input h-[200px]" />
                </div>
                <div className="space-y-2 flex gap-4 items-end">
                    <div className="space-y-2 w-[30%]">
                        <label className="heading-body">Bắt đầu</label>
                        <input type="datetime-local" name="start_time" value={form.start_time} onChange={handleOnchange} className="Digital-Login-Input"/>
                    </div>
                    <div className="space-y-2 w-[30%]">
                        <label className="heading-body">Kết thúc</label>
                        <input type="datetime-local" name="end_time" value={form.end_time} onChange={handleOnchange} className="Digital-Login-Input"/>
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
                        <div className={slug ? "block" : "hidden"}>
                            <button type="button" onClick={() => setDeleted(true)} className="admin-confirm-button px-6 bg-red-600">Xoá</button>
                        </div>
                    </div>
                </div>
            </form>
            {deleted && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="bg-black/60 backdrop-blur-sm absolute inset-0" />
                    <div className=" bg-[#f5f5f3] flex flex-col justify-between rounded-md space-y-4 p-6 relative z-10 w-[70vw] lg:w-[20vw]">
                        <div className="flex-1">
                            <div className="heading-body">Có chắc muốn xoá?</div>
                            <div className="heading-body font-bold">{form.title}</div>
                        </div>
                        <div className="flex gap-2 items-end justify-around w-full">
                            <div className="">
                                <button type="button" disabled={loading} className="admin-confirm-button px-6 bg-red-600" onClick={() => { Delete(getId) }}>Có</button>
                            </div>
                            <div className="">
                                <button type="button" disabled={loading} className="admin-confirm-button" onClick={() => setDeleted(false)}>Không</button>
                            </div>
                        </div>
                        <div className="w-full text">
                            {errPopup && (
                                <ErrorNoti err={errPopup} />
                            )}
                            {succPopup && (
                                <SuccessNoti succ={succPopup} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}