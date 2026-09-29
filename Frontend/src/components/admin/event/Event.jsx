import { useState, useEffect } from 'react';
import eventApi from '../../../api/eventApi';
import { Link, useNavigate } from 'react-router-dom';
import ErrorNoti from '../../comon/Noti/Error';


export default function EventLayout() {
    const [type, setType] = useState('all');
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);
    const [event, setEvent] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [more, setMore] = useState(false);
    const [popup, setPopup] = useState({ title: "", description: "", content: "", img: "", start_time: "", end_time: "", status: "" });
    const navigate = useNavigate();
    const labelMap = {
        'all': 'Tất cả',
        'happening': 'Đang diễn ra',
        'upcoming': 'Chưa diễn ra',
        'ended': 'Đã kết thúc'
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setErr('');
                const apiType = type === 'all' ? null : type;
                let res;
                if (searchKeyword) {
                    res = await eventApi.searchByAdmin(page, 20, searchKeyword, apiType);
                } else {
                    res = await eventApi.get(apiType, page, 20);
                }
                const eventArray = res.data?.data?.data || res.data?.data || [];
                setEvent(eventArray);
                const total = res.data?.data?.pagination?.totalPages || res.data?.pagination?.totalPages || 1;
                setTotalPages(total);
            } catch (error) {
                handleApiError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [page, type, searchKeyword]);

    useEffect(() => {
        setPage(1);
    }, [type]);


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
        setSearchQuery(e.target.value);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const keyword = searchQuery.trim();
        if (!keyword) {
            setSearchKeyword('');
            setPage(1);
            setErr('');
            return;
        }
        setErr('');
        setPage(1);
        setSearchKeyword(keyword);
    };
    const ChangeType = (e) => {
        const value = e.target.value;
        setType(value);
        setPage(1);
    };

    const toggleMore = (title, description, content, img, start_time, end_time, status) => {
        if (more) {
            setMore(false);
            setPopup({ title: "", description: "", content: "", img: "", start_time: "", end_time: "", status: "" });
        } else {
            setMore(true);
            setPopup({ title: title, description: description, content: content, img: img, start_time: start_time, end_time: end_time, status: status });
        }
    };

    const getViText = (textData) => {
        if (!textData) return "";
        if (typeof textData === 'object' && textData.vi) return textData.vi;
        if (typeof textData === 'string') {
            try {
                const parsed = JSON.parse(textData);
                return parsed.vi || textData;
            } catch {
                return textData;
            }
        }
        return "";
    };

    const displayList = event;

    if (loading) return <div className="p-8 text-center text-gray-500">Đang kết nối...</div>;

    return (
        <section className="h-full max-w-[96%] mx-auto space-y-2 relative">
            <div className='heading text-black p-2'>Sự kiện</div>
            <div className='flex gap-2'>
                <div className='flex-1 text hidden lg:block'>
                    {err && (
                        <ErrorNoti err={err} />
                    )}
                </div>
                <div className='lg:w-[12%]'>
                    <select name='type' value={type} onChange={ChangeType} className='admin-select'>
                        <option value="all">Tất cả</option>
                        <option value="ended">Đã kết thúc</option>
                        <option value="happening">Đang diễn ra</option>
                        <option value="upcoming">Chưa diễn ra</option>
                    </select>
                </div>
                <div className='lg:w-[40%] flex lg:gap-1 lg:justify-normal'>
                    <form onSubmit={handleSearch} className='flex w-full'>
                        <button type='submit' disabled={loading} className='admin-button-search'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14" /></svg></button>
                        <input spellcheck="false" type='text' value={searchQuery} onChange={handleOnchange} placeholder='Tìm kiếm gì đó...' className='admin-input-search' />
                    </form>
                    <Link to='/admin/event/custom' className='admin-add-button '><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="#fff" d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z" /></svg></Link>
                </div>
            </div>
            <div className='flex-1 text block lg:hidden'>
                {err && (
                    <ErrorNoti err={err} />
                )}
            </div>
            {displayList?.length === 0 && !loading && (
                <div className="border border-gray-800 h-[80vh] w-full flex flex-col items-center justify-center">
                    <div className='heading-body'>Hiện tại chưa có bản ghi nào.</div>
                    <div className=''>
                        <Link to="/admin/event/custom" className='bg-[#4A67ED] text-button flex gap-1 p-2 rounded-lg'>
                            Tạo mới <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z" /></svg>
                        </Link>
                    </div>
                </div>
            )}
            {displayList?.length > 0 && (
                <div className='border border-gray-800 rounded-md w-full h-[80vh] overflow-y-auto'>
                    <table className='w-full text-lg lg:text-base'>
                        <thead className="bg-gray-200 sticky top-0 z-10 shadow-[0_1px_0_0_black]">
                            <tr className="border-b border-black heading-body">
                                <th className="p-2 text-left lg:w-[30%] w-[40%]">Sự kiện</th>
                                <th className="p-2 text-left hidden lg:table-cell">Slug</th>
                                <th className="p-2 text-left hidden lg:table-cell">Ngày bắt đầu</th>
                                <th className="p-2 text-left hidden lg:table-cell">Ngày kết thúc</th>
                                <th className="p-2 text-left">Trạng thái</th>
                                <th className="p-2 text-left">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayList?.map((item) => {
                                return (
                                    <tr key={item.id} onClick={() => toggleMore(item.title, item.description, item.content, item.banner_url, item.start_time, item.end_time, item.computed_status)} className="border-b text hover:bg-gray-50 cursor-pointer transition-colors">
                                        <td className="p-2">
                                            <div className="font-medium">{getViText(item.title)}</div>
                                        </td>
                                        <td className="p-2 hidden lg:table-cell">
                                            <div className="font-medium">{item.slug}</div>
                                        </td>
                                        <td className="p-2 hidden lg:table-cell">
                                            {new Date(item.start_time).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td className="p-2 hidden lg:table-cell">
                                            {new Date(item.end_time).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td className="p-2">
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] uppercase font-bold">
                                                {labelMap[item.computed_status] || item.computed_status}
                                            </span>
                                        </td>
                                        <td className="p-2 text-left">
                                            <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/event/custom/${item.slug}`); }} className="px-4 py-2 rounded cursor-pointer text-xs text-white bg-[#4A67ED]">
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
            {more && (
                <div className="absolute inset-0 flex flex-col z-50">
                    <div className="bg-black/60 blur-3xl absolute inset-0" />
                    <div className=" bg-[#f5f5f3] flex-1 overflow-y-auto overflow-x-hidden rounded-md space-y-2 p-2 absolute h-[70vh] w-[80vw] lg:w-[60vw] top-[10%] left-[10%] lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
                        <div className="p-2 items-center justify-between w-full rounded-sm bg-[#191B1D] sticky inset-0">
                            <div className="flex gap-2">
                                <div className='flex-1 flex justify-between items-center'>
                                    <div className="font-inter font-bold text-gray-300 max-w-[80%]">
                                        {getViText(popup.title)}
                                    </div>
                                    <div className='hidden lg:flex items-center p-2 bg-blue-100 text-blue-700 rounded-full text-[10px] uppercase font-bold'>
                                        {labelMap[popup.status] || popup.status}
                                    </div>
                                </div>
                                <div className="">
                                    <button type="button" onClick={toggleMore}><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.758 17.243L12.001 12m5.243-5.243L12 12m0 0L6.758 6.757M12.001 12l5.243 5.243" /></svg></button>
                                </div>
                            </div>
                            <div className='lg:hidden inline-block items-center px-1 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[8px] uppercase font-bold'>
                                {labelMap[popup.status] || popup.status}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className='lg:grid lg:grid-cols-[60%_40%] lg:grid-rows-[2%_1fr] gap-4 lg:space-y-0 space-y-2'>
                                <div className='row-span-2'>
                                    <img src={popup.img} alt='img' className='w-full h-auto' />
                                </div>
                                <div className='flex lg:gap-4 row-span-1'>
                                    <div className='font-inter'>
                                        <span className='font-bold'>Bắt đầu: </span>{new Date(popup.start_time).toLocaleDateString("vi-VN")}
                                    </div>
                                    <div className='font-inter'>
                                        <span className='font-bold'>Kết thúc: </span>{new Date(popup.end_time).toLocaleDateString("vi-VN")}
                                    </div>
                                </div>
                                <div className=''>
                                    <span className='font-bold'>Mô tả</span>
                                    <div className='text whitespace-pre-wrap'>
                                        {getViText(popup.description)}
                                    </div>
                                </div>
                            </div>
                            <span className='font-bold'>Nội dung</span>
                            <div className="text whitespace-pre-wrap flex-1">
                                {getViText(popup.content)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}