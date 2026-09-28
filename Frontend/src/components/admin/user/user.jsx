import { useState, useEffect } from 'react';
import userApi from '../../../api/userApi';
import { Link } from 'react-router-dom';
import ErrorNoti from '../../comon/Noti/Error';

export default function UserLayout() {
    const [err, setErr] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');

    const searchKeywordMap = {
        admin: [
            'quản trị',
            'quản lý',
            'người quản lý',
            'admin',
        ],
        user: [
            'người dùng',
            'user',
            'người dùng thông thường'
        ]
    };

    const normalizeSearchKeyword = (keyword) => {
        const normalized = keyword.trim().toLowerCase();
        for (const [canonical, keywords] of Object.entries(searchKeywordMap)) {
            if (keywords.includes(normalized)) {
                return canonical;
            }
        }
        return normalized;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                let res;
                const keyword = normalizeSearchKeyword(searchKeyword);
                if (searchKeyword) {
                    res = await userApi.searchByAdmin(
                        page,
                        20,
                        keyword
                    );
                } else {
                    res = await userApi.getUser(
                        page,
                        20
                    );
                }
                setUser(res.data.data.data);
                setTotalPages(res.data.data.pagination.totalPages);
            } catch (error) {
                handleApiError(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [page, searchKeyword]);

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

    const searchUser = (e) => {
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

    const toggleBan = async (userId) => {
        try {
            await userApi.ban(userId);
            setUser(prev =>
                prev.map(u => u.id === userId ? { ...u, is_banned: !u.is_banned } : u)
            );
        } catch (error) {
            handleApiError(error);
        }
    };

    const displayList = user;

    if (loading) return <div className="p-8 text-center text-gray-500">Đang kết nối...</div>;

    return (
        <section className="h-full max-w-[96%] mx-auto space-y-2">
            <div className='heading text-black p-2'>Người dùng</div>
            <div className='flex gap-2'>
                <div className='flex-1 text hidden lg:block'>
                    {err && (
                        <ErrorNoti err={err} />
                    )}
                </div>
                <div className='lg:w-[50%] flex lg:gap-1 w-full lg:justify-normal'>
                    <form onSubmit={searchUser} className='flex w-full'>
                        <button type='submit' disabled={loading} className='admin-button-search'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14" /></svg></button>
                        <input spellcheck="false" type='text' value={searchQuery} onChange={handleOnchange} placeholder='Tìm kiếm gì đó...' className='admin-input-search' />
                    </form>
                    <Link to='/admin/user/add' className='admin-add-button'><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="#fff" d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z" /></svg></Link>
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
                        <Link to="/admin/user/add" className='bg-[#4A67ED] text-button flex gap-1 p-2 rounded-lg'>
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
                                <th className="p-2 text-left">Tên & Email</th>
                                <th className="p-2 text-left hidden lg:table-cell">Ngày tạo</th>
                                <th className="p-2 text-left hidden lg:table-cell">Ngày sửa đổi</th>
                                <th className="p-2 text-left hidden lg:table-cell">Quyền</th>
                                <th className="p-2 text-left">Trạng thái</th>
                                <th className="p-2 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayList.map((item, index) => {
                                const labelMap = { 'user': 'người dùng', 'admin': 'quản trị' }
                                return (
                                    <tr key={item.id} className="border-b text hover:bg-gray-50 transition-colors">
                                        <td className="p-2">
                                            <div className="font-medium">{item.full_name} <span className='text-gray-600 lg:text-base text-sm'>#{item.user_tag}</span></div>
                                            <div className="text-xs text-gray-500 lg:hidden">{item.email}</div>
                                            <div className="hidden lg:block text-xs text-gray-400">{item.email}</div>
                                        </td>
                                        <td className="p-2 hidden lg:table-cell">
                                            {new Date(item.created_at).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td className="p-2 hidden lg:table-cell">
                                            {new Date(item.updated_at).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td className="p-2 hidden lg:table-cell">
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] uppercase font-bold">
                                                {labelMap[item.role] || item.role}
                                            </span>
                                        </td>
                                        <td className="p-2">
                                            {item.is_banned ? <span className="text-red-500 text-xs font-bold">Bị chặn</span> : <span className="text-green-500 text-xs font-bold">Hoạt động</span>}
                                        </td>
                                        <td className="p-2 text-center">
                                            <button onClick={() => toggleBan(item.id)} className={`px-4 py-2 cursor-pointer rounded text-xs text-white ${item.is_banned ? 'bg-gray-500' : 'bg-red-500'}`}>
                                                {item.is_banned ? "Huỷ chặn" : "Chặn"}
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
        </section>
    );
}