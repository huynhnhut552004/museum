import { useState, useEffect } from 'react';
import artworkApi from '../../../api/artworkApi';
import { Link, useNavigate } from 'react-router-dom';
import ErrorNoti from '../../comon/Noti/Error';

export default function ArtworkLayout() {
    const [err, setErr] = useState('');
    const [layout, setLayout] = useState('');
    const [loading, setLoading] = useState(false);
    const [artwork, setArtwork] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [more, setMore] = useState(false);
    const [popup, setPopup] = useState({ title: "", img: "", artist: "", desc: "", status: "", slug: "", year: "" });
    const navigate = useNavigate();

    const labelMap = {
        'published': 'Công khai',
        'draft': 'Bản nháp',
        'hidden': 'Ẩn'
    };

    const searchArtwork = (e) => {
        e.preventDefault();
        const keyword = searchQuery.trim();
        if (!keyword) {
            setSearchKeyword('');
            setPage(1);
            return;
        }
        setErr('');
        setPage(1);
        setSearchKeyword(keyword);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const apiLayout = layout === '' ? null : layout;
                let res;
                if (searchKeyword) {
                    res = await artworkApi.searchByadmin(page, 20, searchKeyword, apiLayout);
                } else {
                    res = await artworkApi.getByAdmin(page, 20, apiLayout);
                }
                setArtwork(res.data.data);
                setTotalPages(res.data.pagination.totalPages);
            } catch (error) {
                handleApiError(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [page, layout, searchKeyword]);

    useEffect(() => {
        setPage(1);
    }, [layout]);

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
        if (value.trim() === '') setErr('');
    };

    const getArtworkLabel = (data) => {
        if (data === 'classic') {
            return { text: 'Truyền thống' };
        } else if (data === 'digital') {
            return { text: 'Kỹ thuật số' };
        } else {
            return { text: 'Cả hai' };
        }
    };

    const ChangeLayout = (e) => {
        const value = e.target.value;
        setLayout(value);
    };

    const toggleMore = (title, img, artist, desc, status, slug, year) => {
        if (more) {
            setMore(false);
            setPopup({ title: "", img: "", artist: "", desc: "", status: "", slug: "", year: "" });
        } else {
            setMore(true);
            setPopup({ title: title, img: img, artist: artist, desc: desc, status: status, slug: slug, year: year });
        }
    };

    const displayList = artwork;

    if (loading) return <div className="p-8 text-center text-gray-500">Đang kết nối...</div>;

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
                    <form onSubmit={searchArtwork} className='flex w-full'>
                        <button type='submit' disabled={loading} className='admin-button-search'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14" /></svg></button>
                        <input spellcheck="false" type='text' value={searchQuery} onChange={handleOnchange} placeholder='Tìm kiếm gì đó...' className='admin-input-search' />
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
                                const labelData = getArtworkLabel(item.layout_type);
                                return (
                                    <tr key={item.id} onClick={() => toggleMore(item.title, item.media_url, item.artist_display_name, item.description, item.status, item.slug, item.year)} className="border-b text hover:bg-gray-50 cursor-pointer transition-colors">
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
                                            <span className=" text-blue-700 text-xs uppercase font-bold">
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
                    <div className="flex justify-center items-center gap-1 py-4">
                        <button disabled={page === 1} onClick={() => setPage(prev => prev - 1)} className="px-3 py-2 border rounded disabled:opacity-30">‹</button>
                        {(() => {
                            const pages = [];
                            if (totalPages <= 7) {
                                for (let i = 1; i <= totalPages; i++) {
                                    pages.push(i);
                                }
                            } else if (page <= 4) {
                                pages.push(1, 2, 3, 4, 5, 6, '...', totalPages);
                            } else if (page >= totalPages - 3) {
                                pages.push(
                                    1,
                                    '...',
                                    totalPages - 5,
                                    totalPages - 4,
                                    totalPages - 3,
                                    totalPages - 2,
                                    totalPages - 1,
                                    totalPages
                                );
                            } else {
                                pages.push(
                                    1,
                                    '...',
                                    page - 1,
                                    page,
                                    page + 1,
                                    '...',
                                    totalPages
                                );
                            }
                            return pages.map((item, index) =>
                                item === '...' ? (
                                    <span key={`dots-${index}`} className="px-2 py-2">...</span>
                                ) : (
                                    <button key={item} onClick={() => setPage(item)} className={`px-3 py-2 border rounded ${page === item ? 'bg-[#4A67ED] text-white' : 'bg-white hover:bg-gray-100'}`}>{item}</button>
                                )
                            );
                        })()}
                        <button disabled={page === totalPages} onClick={() => setPage(prev => prev + 1)} className="px-3 py-2 border rounded disabled:opacity-30">›</button>
                    </div>
                </div>
            )}
            {more &&
                (
                    <div className="absolute inset-0 flex flex-col z-50">
                        <div className="bg-black/60 blur-3xl absolute inset-0" />
                        <div className=" bg-[#f5f5f3] flex-1 overflow-y-auto overflow-x-hidden rounded-md space-y-2 p-2 absolute h-[70vh] w-[80vw] lg:w-[60vw] top-[10%] left-[10%] lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
                            <div className=" p-2 items-center justify-between w-full rounded-sm bg-[#191B1D] sticky inset-0">
                                <div className="flex gap-2">
                                    <div className='flex-1 flex justify-between gap-2'>
                                        <div className="font-inter font-bold text-gray-300">
                                            {popup.title}
                                        </div>
                                        <div className='flex gap-4'>
                                            <div className='hidden lg:flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] uppercase font-bold'>
                                                {labelMap[popup.status] || popup.status}
                                            </div>
                                            {popup.year && (
                                                <div className='hidden lg:flex items-center px-4 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] uppercase font-bold'>
                                                    {popup.year}
                                                </div>
                                            )}
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
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className='flex justify-between'>
                                    <div className='text'>
                                        <span className='font-bold'>Tác giả: </span>
                                        {popup.artist}
                                    </div>
                                </div>
                                <div className='flex justify-between'>
                                    <div className='text'>
                                        <span className='font-bold'>Đường dẫn: </span>
                                        {popup.slug}
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