import { useState, useEffect, useRef, useCallback } from 'react';
import artworkApi from '../../../api/artworkApi';
import { Link, useNavigate } from 'react-router-dom';
import ErrorNoti from '../../comon/Noti/Error';

export default function ArtworkLayout() {
    const [err, setErr] = useState('');
    const [layout, setLayout] = useState('');
    const [loading, setLoading] = useState(false);
    const [artwork, setArtwork] = useState([]);
    const [page, setPage] = useState(1);
    const [halgore, setHalgore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [result, setResult] = useState(null);
    const [more, setMore] = useState(false);
    const [popup, setPopup] = useState({ title: "", img: "", artist: "", desc: "", status: "", category: null });
    const navigate = useNavigate();
    const observer = useRef();

    const labelMap = {
        'published': 'Công khai',
        'draft': 'Bản nháp',
        'hidden': 'Ẩn'
    }

    const lastRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        if (result) return;
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && halgore) {
                setPage(prev => prev + 1);
            }
        }, {
            rootMargin: "200px"
        });
        if (node) observer.current.observe(node);
    }, [loading, halgore, result]);

    const getArtwork = async () => {
        if (!halgore && page !== 1) return;
        try {
            setLoading(true);
            const apiLayout = layout === '' ? null : layout;
            const limit = 20;
            const res = await artworkApi.getByAdmin(page, limit, apiLayout);
            const newData = res.data.data;
            if (newData.length === 0) {
                setHalgore(false);
            } else {
                setArtwork(prev => {
                    if (page === 1) return newData;
                    const uniqueData = newData.filter(
                        (newArt) => !prev.some((oldArt) => oldArt.id === newArt.id)
                    );
                    return [...prev, ...uniqueData];
                });
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        setArtwork([]);
        setPage(1);
        setHalgore(true);
        setResult(null);
    }, [layout]);

    useEffect(() => {
        getArtwork();
    }, [page, layout]);

    const handleApiError = (error) => {
        if (error.response) {
            const status = error.response.status;
            if (status === 401) setErr("Đăng nhập hết hạn, vui lòng đăng nhập lại!");
            else if (status === 404) setErr("Không tìm thấy dữ liệu!");
            else setErr("Lỗi hệ thống!");
        } else {
            setErr("Không thể kết nối đến Server!");
        }
    };

    const handleOnchange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (value.trim() === '') {
            setResult(null);
            setErr('');
        }
    };

    const getArtworkLabel = (categories) => {
        if (!categories || categories.length === 0) return { text: 'Chưa phân loại', class: 'bg-gray-100 text-gray-600' };
        const hasClassic = categories.some(cat => cat.layout_type === 'classic');
        const hasDigital = categories.some(cat => cat.layout_type === 'digital');
        if (hasClassic && hasDigital) {
            return { text: 'Tất cả' };
        } else if (hasClassic) {
            return { text: 'Truyền thống' };
        } else if (hasDigital) {
            return { text: 'Kỹ thuật số' };
        }
        return { text: 'Khác', class: 'bg-gray-100 text-gray-600' };
    };

    const ChangeLayout = (e) => {
        const value = e.target.value;
        setLayout(value);
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

    const handleLocalSearch = (e) => {
        e.preventDefault();
        const term = searchQuery.trim();
        if (!term) {
            setResult(null);
            setErr('Vui lòng nhập từ khóa tìm kiếm!');
            return;
        }
        const normalizedTerm = removeAccentsAndSpaces(term);
        const statusMap = {
            'published': 'congkhai',
            'draft': 'bannhaptam',
            'hidden': 'dangan'
        }
        const filteredCateory = artwork.filter(a => {
            const titleSearch = removeAccentsAndSpaces(a.title || "");
            const slugSearch = removeAccentsAndSpaces(a.slug || "");
            const artistNameSearch = removeAccentsAndSpaces(a.artist_display_name || "");
            const yearSearch = removeAccentsAndSpaces(String(a.year) || "");
            const statusSearch = statusMap[a.status] || "";
            return slugSearch.includes(normalizedTerm) || titleSearch.includes(normalizedTerm) || artistNameSearch.includes(normalizedTerm) || yearSearch.includes(normalizedTerm) || statusSearch.includes(normalizedTerm);
        });
        setResult(filteredCateory);
        if (filteredCateory.length === 0) {
            setErr("Không tìm thấy kết quả nào khớp chính xác!");
        } else {
            setErr("");
        }
    };

    const toggleMore = (title, img, artist, desc, status, category) => {
        if (more) {
            setMore(false);
            setPopup({ title: "", img: "", artist: "", desc: "", status: "", category: null });
        } else {
            setMore(true);
            setPopup({ title: title, img: img, artist: artist, desc: desc, status: status, category: category });
        }
    };
    const displayList = result ? result : artwork;

    return (
        <section className="h-full max-w-[96%] mx-auto space-y-2 relative">
            <div className='heading text-black p-2'>Tác phẩm</div>
            <div className='flex gap-2'>
                <div className='flex-1 text hidden lg:block'>
                    {err && (
                        <ErrorNoti err={err} />
                    )}
                </div>
                <div className='lg:w-[12%]'>
                    <select name='layout' value={layout} onChange={ChangeLayout} className='admin-select'>
                        <option value="">Tất cả</option>
                        <option value="classic">Truyền thống</option>
                        <option value="digital">Kỹ thuật số</option>
                        <option value="both">Cả hai</option>
                    </select>
                </div>
                <div className='lg:w-[40%] flex lg:gap-1 lg:justify-normal'>
                    <form onSubmit={handleLocalSearch} className='flex w-full'>
                        <button type='submit' disabled={loading} className='admin-button-search'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14" /></svg></button>
                        <input type='text' value={searchQuery} onChange={handleOnchange} placeholder='Tìm kiếm gì đó...' className='admin-input-search' />
                    </form>
                    <Link to='/admin/artwork/custom' className='admin-add-button '><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="#fff" d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z" /></svg></Link>
                </div>
            </div>
            <div className='flex-1 text block lg:hidden'>
                {err && (
                    <ErrorNoti err={err} />
                )}
            </div>
            {displayList.length === 0 && !loading && (
                <div className="border border-gray-800 h-[80vh] w-full flex flex-col items-center justify-center">
                    <div className='heading-body'>Hiện tại chưa có bản ghi nào.</div>
                    <div className=''>
                        <Link to="/admin/artwork/custom" className='bg-[#4A67ED] text-button flex gap-1 p-2 rounded-lg'>
                            Tạo mới <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z" /></svg>
                        </Link>
                    </div>
                </div>
            )}
            {displayList.length > 0 && (
                <div className='border border-gray-800 rounded-md w-full h-[80vh] overflow-y-auto'>
                    <table className='w-full text-lg lg:text-base'>
                        <thead className="bg-gray-200 sticky top-0 z-10 shadow-[0_1px_0_0_black]">
                            <tr className="border-b border-black heading-body">
                                <th className="p-2 text-left">Tác phẩm</th>
                                <th className="p-2 text-left">Tác giả</th>
                                <th className="p-2 text-left hidden lg:table-cell">Ngày tạo</th>
                                <th className="p-2 text-left hidden lg:table-cell">Năm sáng tác</th>
                                <th className="p-2 text-left">Trạng thái</th>
                                <th className="p-2 text-left">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayList.map((item, index) => {
                                const isLast = index === displayList.length - 1;
                                const labelData = getArtworkLabel(item.categories);
                                return (
                                    <tr key={item.id} ref={isLast ? lastRef : null} onClick={() => toggleMore(item.title, item.media_url, item.artist_display_name, item.description, item.status, item.categories)} className="border-b text hover:bg-gray-50 cursor-pointer transition-colors">
                                        <td className="p-2">
                                            <div className="font-medium">{item.title}</div>
                                            <span className={`px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] uppercase font-bold ${labelData.class}`}>
                                                {labelData.text}
                                            </span>
                                        </td>
                                        <td className="p-2">
                                            <div className="font-medium">{item.artist_display_name}</div>
                                            <div className={`text-xs text-gray-500 ${item.artist_id ? "block" : "hidden"}`}>Tác phẩm của người dùng</div>
                                        </td>
                                        <td className="p-2 hidden lg:table-cell">
                                            {new Date(item.created_at).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td className="p-2 hidden lg:table-cell">
                                            {item.year}
                                        </td>
                                        <td className="p-2">
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] uppercase font-bold">
                                                {labelMap[item.status] || item.status}
                                            </span>
                                        </td>
                                        <td className="p-2 text-left">
                                            <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/artwork/custom/${item.id}`); }} className="px-4 py-2 rounded cursor-pointer text-xs text-white bg-[#4A67ED]">
                                                Sửa
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            {more &&
                (
                    <div className="absolute inset-0 flex flex-col z-50">
                        <div className="bg-black/60 blur-3xl absolute inset-0" />
                        <div className=" bg-[#f5f5f3] flex-1 overflow-y-auto overflow-x-hidden rounded-md space-y-2 p-2 absolute h-[70vh] w-[80vw] lg:w-[60vw] top-[10%] left-[10%] lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
                            <div className=" p-2 items-center justify-between w-full rounded-sm bg-[#191B1D] sticky inset-0">
                                <div className="flex gap-2">
                                    <div className='flex-1 flex gap-2'>
                                        <div className="font-inter font-bold text-gray-300">
                                            {popup.title}
                                        </div>
                                        <div className='hidden lg:flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] uppercase font-bold'>
                                            {labelMap[popup.status] || popup.status}
                                        </div>
                                        <div className={`hidden lg:flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] uppercase font-bold ${getArtworkLabel(popup.category).class}`}>
                                            {getArtworkLabel(popup.category).text}
                                        </div>
                                    </div>
                                    <div className="">
                                        <button type="button" onClick={toggleMore}><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.758 17.243L12.001 12m5.243-5.243L12 12m0 0L6.758 6.757M12.001 12l5.243 5.243" /></svg></button>
                                    </div>
                                </div>
                                <div className='flex gap-2'>
                                <div className='lg:hidden flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[8px]  uppercase font-bold'>
                                     {labelMap[popup.status] || popup.status}
                                </div>
                                <div className={`lg:hidden flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full  text-[8px] uppercase font-bold ${getArtworkLabel(popup.category).class}`}>
                                    {getArtworkLabel(popup.category).text}
                                </div>
                            </div>
                            </div>
                            <div className="space-y-2">
                                <div className='flex justify-between'>
                                    <div className='text lg:w-[20%] w-[30%]'>
                                        <span className='font-bold'>Tác giả: </span>
                                        {popup.artist}
                                    </div>
                                    <div className='flex-1 text-right'>
                                        <span className='font-bold'>Danh mục:</span>
                                        <div className='flex justify-end flex-wrap gap-2'>
                                            {popup.category.map((item, index) => (
                                                <div key={item.id} className='text'>
                                                    {item.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className='flex gap-2'>
                                    <div className='w-[50%]'>
                                        <img src={popup.img} alt='img' className='w-full h-auto' />
                                    </div>
                                    <div className='text flex-1'>
                                        <span className='font-bold'>Nội dung:</span>
                                        <div className=" whitespace-pre-wrap">
                                            {popup.desc}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
        </section>
    );
}