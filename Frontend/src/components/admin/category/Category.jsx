import { useState, useEffect } from 'react';
import categoryApi from '../../../api/categoryApi';
import { Link, useNavigate } from 'react-router-dom';
import ErrorNoti from '../../comon/Noti/Error';

export default function CategoryLayout() {
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [result, setResult] = useState(null);
    const navigate = useNavigate();

    const getCategory = async () => {
        try {
            setLoading(true);
            const res = await categoryApi.getAll();
            const newData = res.data.data;
            setCategory(newData);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCategory();
    }, []);

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
        const layoutMap = {
                'both': 'tatcahai',
                'classic': 'nghethuattruyenthong',
                'digital': 'nghethuatkythuatso'
            }
        const filteredCateory = category.filter(c => {
            const nameSearch = removeAccentsAndSpaces(c.name || "");
            const slugSearch = removeAccentsAndSpaces(c.slug || "");
            const layoutSearch = layoutMap[c.layout_type] || "";
            return slugSearch.includes(normalizedTerm) || nameSearch.includes(normalizedTerm) || layoutSearch.includes(normalizedTerm);
        });
        setResult(filteredCateory);
        if (filteredCateory.length === 0) {
            setErr("Không tìm thấy kết quả nào khớp chính xác!");
        } else {
            setErr("");
        }
    };

    const displayList = result ? result : category;

    return (
        <section className="h-full max-w-[96%] mx-auto space-y-2">
            <div className='heading text-black p-2'>Danh mục</div>
            <div className='flex gap-2'>
                <div className='flex-1 text hidden lg:block'>
                    {err && (
                        <ErrorNoti err={err} />
                    )}
                </div>
                <div className='lg:w-[50%] flex lg:gap-1 w-full lg:justify-normal'>
                    <form onSubmit={handleLocalSearch} className='flex w-full'>
                        <button type='submit' disabled={loading} className='admin-button-search'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14" /></svg></button>
                        <input type='text' value={searchQuery} onChange={handleOnchange} placeholder='Tìm kiếm gì đó...' className='admin-input-search' />
                    </form>
                    <Link to='/admin/category/custom' className='admin-add-button'><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="#fff" d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z" /></svg></Link>
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
                        <Link to="/admin/category/custom" className='bg-[#4A67ED] text-button flex gap-1 p-2 rounded-lg'>
                            Tạo mới <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z" /></svg>
                        </Link>
                    </div>
                </div>
            )}
            {displayList.length > 0 && (
                <div className='border border-gray-800 rounded-md w-full h-[80vh] overflow-y-auto'>
                    <table className='w-full text-lg lg:text-base'>
                        <thead className="bg-gray-200 sticky top-0 z-10 shadow-[0_1px_0_0_black]">
                            <tr className="heading-body">
                                <th className="p-2 text-left">Danh mục</th>
                                <th className="p-2 text-left hidden lg:table-cell">Slug</th>
                                <th className="p-2 text-left hidden lg:table-cell">Ngày tạo</th>
                                <th className="p-2 text-left">loại</th>
                                <th className="p-2 text-left">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayList.map((item, index) => {
                                const labelMap = {
                                    'both': 'Tất cả',
                                    'classic': 'Truyền thống',
                                    'digital': 'Kỹ thuật số'
                                }
                                return (
                                    <tr key={item.id} className="border-b text hover:bg-gray-50 transition-colors">
                                        <td className="p-2">
                                            <div className="font-medium">{item.name}</div>
                                        </td>
                                        <td className="p-2 lg:table-cell hidden">
                                            <div className="font-medium">{item.slug}</div>
                                        </td>
                                        <td className="p-2 hidden lg:table-cell">
                                            {new Date(item.created_at).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td className="p-2">
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] uppercase font-bold">
                                                {labelMap[item.layout_type] || item.layout_type}
                                            </span>
                                        </td>
                                        <td className="p-2 text-left">
                                            <button onClick={() => navigate(`/admin/category/custom/${item.slug}`)} className="px-4 py-2 rounded cursor-pointer text-xs text-white bg-[#4A67ED]">
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
        </section>
    );
}