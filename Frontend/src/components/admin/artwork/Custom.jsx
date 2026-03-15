import ErrorNoti from "../../comon/Noti/Error";
import SuccessNoti from "../../comon/Noti/Success";
import WarningNoti from "../../comon/Noti/Warning";
import categoryApi from "../../../api/categoryApi";
import artworkApi from "../../../api/artworkApi";
import userApi from "../../../api/userApi";
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from "react";

export default function CustomArtworkLayout() {
    const [layout, setLayout] = useState('');
    const [err, setErr] = useState('');
    const [succ, setSucc] = useState('');
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [errFile, setErrFile] = useState('');
    const [errCategory, setErrCategory] = useState('');
    const [email, setEmail] = useState('');
    const [errUser, setErrUser] = useState('');
    const [warnBan, setWarnBan] = useState('');
    const [hasUser, setHasUser] = useState(false);
    const [result, setResult] = useState(null);
    const [selectList, setSelectedList] = useState([]);
    const fileInputRef = useRef(null);
    const [isVideo, setIsVideo] = useState(false)
    const [searchQuery, setSearchQuery] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [currentAnnotation, setCurrentAnnotation] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [errZoomPoint, setErrZoomPoint] = useState('');
    const [succZoomPoint, setSuccZoomPoint] = useState('');
    const [errGetId, setErrGetId] = useState('');
    const [form, setForm] = useState({ title: "", slug: "", artist_id: "", artist_display_name: "", status: "published", description: "", year: "", category_ids: [], attributes_text: "", annotations: [] });
    const [deleted, setDeleted] = useState(false);
    const [succPopup, setSuccPopup] = useState('');
    const [errPopup, setErrPopup] = useState('');
    const [allCategories, setAllCategories] = useState([]);
    const { id } = useParams();
    const navigate = useNavigate();

    const getCategory = async () => {
        setErrCategory('');
        try {
            const res = await categoryApi.getAll();
            const data = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
            setAllCategories(data);
        } catch (error) {
            setErrCategory('Lỗi lấy danh mục, hãy thử lại!');
        }
    };

    const getArtworkById = async (artworkId) => {
        if (!artworkId) return;
        try {
            const res = await artworkApi.getById(artworkId);
            const data = res.data;
            const hasClassic = data.categories?.some(c => c.layout_type === 'classic');
            const hasDigital = data.categories?.some(c => c.layout_type === 'digital');
            const initialLayout = (hasClassic && hasDigital) ? 'both' : (data.categories?.[0]?.layout_type || 'both');
            setLayout(initialLayout);
            const rawCategories = data.category_ids || data.categories || [];
            const safeCategoryIds = rawCategories.map(c => typeof c === 'object' ? (c.category_id || c.id) : c);
            setForm({
                title: data.title || "",
                slug: data.slug || "",
                artist_id: data.artist_id || null,
                artist_display_name: data.artist_display_name || "",
                status: data.status || "published",
                description: data.description || "",
                year: data.year || "",
                category_ids: safeCategoryIds,
                attributes_text: data.attributes_text || "",
                annotations: data.annotations || []
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
                    setErrGetId('Tác phẩm không tồn tại, vui lòng kiểm tra lại!');
                }
            } else if (error.request) {
                setErrGetId('Lỗi lấy tác phẩm, thử lại sau!');
            } else {
                setErrGetId('Lỗi kết nối server!');
            }
        }
    };

    useEffect(() => {
        getCategory().then(() => {
            if (id) getArtworkById(id);
        });
    }, [id]);

    useEffect(() => {
        if (form.category_ids.length > 0 && allCategories.length > 0) {
            const selected = allCategories.filter(cat =>
                form.category_ids.includes(cat.id)
            );
            setSelectedList(selected);
        } else {
            setSelectedList([]);
        }
    }, [form.category_ids, allCategories]);

    const ChangeLayout = (e) => {
        const value = e.target.value;
        setLayout(value);
    };

    useEffect(() => {
        return () => {
            if (previewUrl && !previewUrl.startsWith('http')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (value.trim() === '') {
            setResult(null);
            setErrCategory('');
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
        setForm(prev => ({
            ...prev,
            artist_id: null,
        }));
    };

    const handleSelect = (item) => {
        setForm(prev => ({
            ...prev,
            category_ids: [...new Set([...prev.category_ids, item.id])]
        }));
        setSelectedList(prev => {
            if (prev.find(i => i.id === item.id)) return prev;
            return [...prev, item];
        });
    };

    const handleRemove = (id) => {
        setForm(prev => ({
            ...prev,
            category_ids: prev.category_ids.filter(itemId => itemId !== id)
        }));
        setSelectedList(prev => prev.filter(item => item.id !== id));
    };

    const removeAccentsAndSpaces = (str) => {
        if (!str) return "";
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/\s+/g, '')
            .toLowerCase();
    };

    const filteredCategoriesByLayout = allCategories.filter(item => 
        layout === 'both' || item.layout_type === layout
    );

    const SearchCategory = () => {
        const term = searchQuery.trim();
        if (!term) {
            setResult(null);
            setErrCategory('Vui lòng nhập từ khóa tìm kiếm!');
            return;
        }
        const normalizedTerm = removeAccentsAndSpaces(term);
                const filteredCategory = filteredCategoriesByLayout.filter(c => {
            const nameSearch = removeAccentsAndSpaces(c.name || "");
            return nameSearch.includes(normalizedTerm);
        });
        setResult(filteredCategory);
        if (filteredCategory.length === 0) {
            setErrCategory("Không tìm thấy kết quả nào khớp chính xác!");
        } else {
            setErrCategory("");
        }
    };

    const getUserByEmail = async (email) => {
        if (!email) return;
        setErrUser('');
        setWarnBan('');
        try {
            const res = await userApi.getByEmail(email);
            const data = res.data.data;
            if (data.is_banned === true) {
                setWarnBan('Người dùng này hiện đang bị chặn!');
            }
            setForm((prev) => ({
                ...prev,
                artist_display_name: data.full_name,
                artist_id: data.id
            }));
            setHasUser(true);
        } catch (error) {
            setHasUser(false);
            setForm((prev) => ({
                ...prev,
                artist_display_name: "",
                artist_id: ""
            }));
            if (error.response) {
                if (error.response.status === 404) {
                    setErrUser('Không tìm thấy người dùng')
                }
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

    const handleSubmitCategory = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            SearchCategory();
        }
    };

    const handleSubmitUser = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            getUserByEmail(email);
        }
    };

    const handleImageClick = (e) => {
        if (e.target.dataset.marker) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setCurrentAnnotation({ x, y, title: "", description: "" });
        setSuccZoomPoint('');
        setErrZoomPoint('');
    };

    const handleAnnotationChange = (e) => {
        const { name, value } = e.target;
        setCurrentAnnotation(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAnnotation = () => {
        if (!currentAnnotation.title || !currentAnnotation.description) {
            setSuccZoomPoint('');
            setErrZoomPoint("Vui lòng nhập đủ tiêu đề và mô tả cho điểm zoom!");
            return;
        }
        setForm(prev => ({
            ...prev,
            annotations: [...prev.annotations, currentAnnotation]
        }));
        setCurrentAnnotation(null);
        setErrZoomPoint('');
        setSuccZoomPoint("Đã lưu điểm zoom.");
        setTimeout(() => setSucc(''), 3000);
    };

    const handleRemoveAnnotation = (indexToRemove) => {
        setForm(prev => ({
            ...prev,
            annotations: prev.annotations.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!form.title || !form.artist_display_name || !form.description || form.category_ids.length === 0 || !form.attributes_text) {
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
        payload.append('artist_id', form.artist_id || "");
        payload.append('artist_display_name', form.artist_display_name);
        payload.append('status', form.status);
        payload.append('description', form.description);
        payload.append('year', form.year);
        payload.append('category_ids', JSON.stringify(form.category_ids));
        payload.append('attributes_text', form.attributes_text);
        payload.append("annotations", JSON.stringify(form.annotations));
        try {
            if (id) {
                await artworkApi.update(id, payload);
                setSucc('Cập nhật thành công!');
            } else {
                if (!file) {
                    setErr("Vui lòng chọn hoặc kéo thả ảnh/video!");
                    return;
                }
                await artworkApi.create(payload);
                setSucc('Tạo tác phẩm thành công!');
                setFile(null);
                setForm({ title: "", slug: "", artist_id: "", artist_display_name: "", status: "published", description: "", year: "", category_ids: [], attributes_text: "", annotations: [] });
                setEmail('');
                setHasUser(false);
                setSelectedList([]);
                setSearchQuery('');
                setResult(null);
                setCurrentAnnotation(null);
                setErr('');
                setErrUser('');
                setWarnBan('');
                setErrCategory('');
                setErrZoomPoint('');
                setSuccZoomPoint('');
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

    const displayList = result ? result : filteredCategoriesByLayout;

    return (
        <section className="h-full max-w-[96%] mx-auto flex flex-col justify-center">
            <div className="">
                <div className="">
                    <Link to="/admin/artwork/" className="flex heading-body items-center"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="black" d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42a.996.996 0 0 0-1.41 0l-6.59 6.59a.996.996 0 0 0 0 1.41l6.59 6.59a.996.996 0 1 0 1.41-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1" /></svg>Trở về</Link>
                </div>
                <div className={`heading text-black p-2 ${id ? "hidden" : "block"}`}>Thêm tác phẩm</div>
                <div className={`heading text-black p-2 ${id ? "block" : "hidden"}`}>Cập nhật tác phẩm</div>
                {errGetId && (<ErrorNoti err={errGetId} />)}
            </div>
            <form onSubmit={handleSubmit} className="border overflow-y-auto border-gray-800 bg-gray-200 p-2 rounded-md w-full lg:h-[80vh] h-[70vh] space-y-4 flex flex-col justify-around">
                <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                        <label className="heading-body">Tên tác phẩm</label>
                        <input type="text" name="title" value={form.title} onChange={handleOnchange} className="Digital-Login-Input" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="heading-body">Slug</label>
                        <input type="text" name="slug" value={form.slug} onChange={handleOnchange} className="Digital-Login-Input" />
                    </div>
                </div>
                <div className="">
                    <div className="flex gap-2 items-end">
                        <div className="lg:w-[30%] w-[40%] space-y-2">
                            <label className="heading-body">Email</label>
                            <div onKeyDown={handleSubmitUser} className="flex">
                                <button type="button" onClick={() => getUserByEmail(email)} className="admin-button-search"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14" /></svg></button>
                                <input type="email" name="email" value={email} onChange={emailOnchange} className="Digital-Login-Input" />
                            </div>
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="heading-body">Tên tác giả</label>
                            <input type="text" disabled={hasUser} name="artist_display_name" value={form.artist_display_name} onChange={handleOnchange} className={`Digital-Login-Input ${hasUser ? "opacity-60 cursor-not-allowed" : ""}`} />
                        </div>
                        {hasUser && (
                            <div className="lg:w-[18%] w-[12%]">
                                <button type="button" onClick={handleClearUser} className="admin-confirm-button px-6 bg-red-600 lg:block hidden">
                                    Hủy liên kết
                                </button>
                                <button type="button" onClick={handleClearUser} className="admin-confirm-button p-3 bg-red-600 lg:hidden block">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><path fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" d="m13.5.5l-13 13m0-13l13 13" stroke-width="1" /></svg>
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="w-full text">
                        {errUser && (
                            <ErrorNoti err={errUser} />
                        )}
                        {warnBan && (
                            <WarningNoti warn={warnBan} />
                        )}
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
                                <div className="text-base text-gray-700 text">
                                    Nhấn để chọn ảnh/video hoặc kéo thả vào đây
                                </div>
                                <div className="text-xs text text-gray-400 mt-2">
                                    Hỗ trợ JPG, PNG, MP4, MOV... (Tối đa 50MB)
                                </div>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
                        <div className="w-full">{errFile && (<ErrorNoti err={errFile} />)}</div>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="heading-body">Mô tả</label>
                    <textarea type="text" name="description" value={form.description} onChange={handleOnchange} className="Digital-Login-Input h-[200px]" />
                </div>
                <div className="flex gap-2">
                    <div className="flex flex-col w-[30%] lg:w-[20%]">
                        <label className="heading-body">Trạng thái</label>
                        <select name="status" value={form.status} onChange={handleOnchange} className="admin-select">
                            <option value="published">Công khai</option>
                            <option value="draft">Bản nháp</option>
                            <option value="hidden">Ẩn</option>
                        </select>
                    </div>
                    <div className="flex flex-col w-[30%] lg:w-[20%]">
                        <label className="heading-body">Loại</label>
                        <select name='layout' value={layout} onChange={ChangeLayout} className='admin-select'>
                            <option value="">Tất cả</option>
                            <option value="classic">Truyền thống</option>
                            <option value="digital">Kỹ thuật số</option>
                        </select>
                    </div>
                    <div className="space-y-2 flex-1">
                        <label className="heading-body">Năm hoàn thiện</label>
                        <input type="text" name="year" value={form.year} onChange={handleOnchange} className="Digital-Login-Input" />
                    </div>
                </div>
                <div className="space-y-2 h-auto">
                    <div className="heading-body">Danh mục</div>
                    <div className="flex gap-2 h-auto ">
                        <div className="flex-1 flex flex-col gap-2 h-auto">
                            <div onKeyDown={handleSubmitCategory} className='flex flex-1 w-full'>
                                <button type='button' onClick={SearchCategory} className='admin-button-search'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14" /></svg></button>
                                <input type='text' value={searchQuery} onChange={handleSearch} placeholder='Tìm kiếm danh mục...' className='admin-input-search' />
                            </div>
                            <div className="flex-1 w-full">
                                <div className="w-full overflow-y-auto h-[200px] border-[2px] p-2 border-gray-300 rounded-md">
                                    {displayList.map((item, index) => (
                                        <div key={item.id} onClick={() => handleSelect(item)} className="text border-b border-gray-400 p-2 lg:hover:bg-black/20 cursor-pointer rounded-md shadow-md">
                                            {item.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col">
                            <div className="text h-[30%]">
                                {errCategory && (
                                    <ErrorNoti err={errCategory} />
                                )}
                            </div>
                            <div className="w-full h-full border-[2px]  p-2 border-gray-300 rounded-md">
                                <div className="flex gap-2 flex-wrap">
                                    {selectList.map((item, index) => (
                                        <div key={item.id} className="">
                                            <div className="border p-1 border-gray-400 shadow-md rounded-md inline-block">
                                                <div className="flex items-center gap-2">
                                                    <div className="text">
                                                        {item.name}
                                                    </div>
                                                    <div className="">
                                                        <button type="button" onClick={() => handleRemove(item.id)}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 40 40"><path fill="#000" d="M21.499 19.994L32.755 8.727a1.064 1.064 0 0 0-.001-1.502c-.398-.396-1.099-.398-1.501.002L20 18.494L8.743 7.224c-.4-.395-1.101-.393-1.499.002a1.05 1.05 0 0 0-.309.751c0 .284.11.55.309.747L18.5 19.993L7.245 31.263a1.064 1.064 0 0 0 .003 1.503c.193.191.466.301.748.301h.006c.283-.001.556-.112.745-.305L20 21.495l11.257 11.27c.199.198.465.308.747.308a1.06 1.06 0 0 0 1.061-1.061c0-.283-.11-.55-.31-.747z" /></svg></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="heading-body">Các thuộc tính của tác phẩm</label>
                    <div className="text-xs text-gray-500 text"><strong>Cách nhập:</strong> Tên: Giá trị 1, Giá trị 2 --- Tên khác: Giá trị... <br /><em>(Ví dụ: Chất liệu: Gỗ --- Màu sắc: Đỏ, Vàng)</em></div>
                    <textarea type="text" name="attributes_text" value={form.attributes_text} onChange={handleOnchange} className="Digital-Login-Input h-[200px]" />
                </div>
                <div className="space-y-4">
                    <label className="heading-body">Điểm zoom ảnh</label>
                    <div className="h-[6%]">
                        {errZoomPoint && (<ErrorNoti err={errZoomPoint} />)}
                        {succZoomPoint && (<SuccessNoti succ={succZoomPoint} />)}
                    </div>
                    {!previewUrl ? (<WarningNoti warn={'Chưa có ảnh!'} />) : (file && file.type.startsWith('video/')) ? (<WarningNoti warn={'Điểm zoom chỉ hỗ trợ cho ảnh!'} />) : (
                        <div className="flex gap-4 items-start">
                            <div className="relative w-2/3 border rounded-md overflow-hidden bg-gray-100 cursor-crosshair shadow-inner" onClick={handleImageClick}>
                                <img src={previewUrl} alt="Preview" className="w-full h-auto block select-none" draggable="false" />
                                {form.annotations.map((anno, index) => (
                                    <div key={index} data-marker="true"
                                        className="absolute w-4 h-4 bg-green-500 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-md cursor-pointer hover:scale-125 transition-transform group"
                                        style={{ left: `${anno.x}%`, top: `${anno.y}%` }}>
                                        <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max bg-black text-white text-xs p-1 rounded z-10">
                                            {anno.title}
                                        </div>
                                    </div>
                                ))}
                                {currentAnnotation && (
                                    <div className="absolute w-5 h-5 bg-red-500 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse shadow-lg"
                                        style={{ left: `${currentAnnotation.x}%`, top: `${currentAnnotation.y}%` }}>
                                    </div>
                                )}
                            </div>
                            <div className="w-1/3 flex flex-col gap-3">
                                {currentAnnotation ? (
                                    <div className="border border-blue-300 bg-blue-50 p-3 rounded-md space-y-3 shadow-md">
                                        <div className="font-semibold text-blue-800 text text-sm">Đang thêm điểm mới</div>
                                        <input type="text" name="title" value={currentAnnotation.title} onChange={handleAnnotationChange} placeholder="Nhập tiêu đề..." className="Digital-Login-Input text-sm w-full" />
                                        <textarea name="description" value={currentAnnotation.description} onChange={handleAnnotationChange} placeholder="Nhập mô tả chi tiết..." className="Digital-Login-Input text-sm w-full h-[80px]" />
                                        <div className="flex gap-2">
                                            <button type="button" onClick={handleSaveAnnotation} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex-1">Xác nhận</button>
                                            <button type="button" onClick={() => setCurrentAnnotation(null)} className="bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-400">Hủy</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border border-gray-300 bg-gray-50 p-3 rounded-md text-sm text-gray-600 text-center flex flex-col items-center justify-center h-[150px]">
                                        <svg className="text w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
                                        Click vào một vị trí bất kỳ trên ảnh để thêm thông tin chú thích.
                                    </div>
                                )}
                                {form.annotations.length > 0 && (
                                    <div className="mt-2 space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                        <div className="font-semibold text-sm text-gray-700">Đã lưu ({form.annotations.length}):</div>
                                        {form.annotations.map((anno, index) => (
                                            <div key={index} className="flex justify-between items-center bg-white border p-2 rounded text-sm shadow-sm">
                                                <span className="truncate text flex-1 font-medium">{anno.title}</span>
                                                <button type="button" onClick={() => handleRemoveAnnotation(index)} className="text-red-500 hover:text-red-700 ml-2" title="Xóa điểm này">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
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
                    <div className="bg-black/60 backdrop-blur-sm absolute inset-0" />
                    <div className=" bg-[#f5f5f3] flex flex-col justify-between rounded-md space-y-4 p-6 relative z-10 w-[70vw] lg:w-[20vw]">
                        <div className="flex-1">
                            <div className="heading-body">Có chắc muốn xoá?</div>
                            <div className="heading-body font-bold">{form.title}</div>
                        </div>
                        <div className="flex gap-2 items-end justify-around w-full">
                            <div className="">
                                <button type="button" disabled={loading} className="admin-confirm-button px-6 bg-red-600" onClick={() => { Delete(id) }}>Có</button>
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