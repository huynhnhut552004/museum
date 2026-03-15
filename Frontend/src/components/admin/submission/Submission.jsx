import submissionApi from "../../../api/submissionApi";
import { useState, useEffect, useRef, useCallback } from 'react';
import ErrorNoti from '../../comon/Noti/Error';

export default function SubmissionLayout() {
    const [err, setErr] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [halgore, setHalgore] = useState(true);
    const [submission, setSubmission] = useState([]);
    const [status, setStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [result, setResult] = useState(null);
    const [more, setMore] = useState(false);
    const [popup, setPopup] = useState({ name: "", email: "", purpose: "", desc: "" });
    const observer = useRef();

    const lastRef = useCallback(node => {
        if (observer.current) observer.current.disconnect();
        if (result) return;
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && halgore && !loading) {
                setPage(prev => prev + 1);
            }
        }, {
            rootMargin: "200px"
        });
        if (node) observer.current.observe(node);
    }, [loading, halgore, result]);

    const getSubmission = async () => {
        try {
            setLoading(true);
            const res = await submissionApi.get({
                page: page,
                limit: 20,
                status: status,
                email: undefined
            });
            const newData = res.data.data;
            if (newData.length === 0) {
                setHalgore(false);
            } else {
                setSubmission(prev => {
                    const uniqueData = newData.filter(
                        (newSubmission) => !prev.some((existingSubmission) => existingSubmission.id === newSubmission.id)
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
        getSubmission();
    }, [page, status]);

    const handleApiError = (error) => {
        if (error.response) {
            console.log(error.response.data.message)
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

    const StatusChange = (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        setPage(1);
        setSubmission([]);
        setHalgore(true);
        setResult(null);
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
                'rule': 'dieukhoannoiquyluatlequyenhan',
                'contact': 'lienhe',
                'feedback': 'gopyphanhoi'
            };
        const filteredSubmission = submission.filter(s => {
            const emailSearch = removeAccentsAndSpaces(s.email || "");
            const nameSearch = removeAccentsAndSpaces(s.name || "");
            const purposeSearch = removeAccentsAndSpaces(s.purpose || "");
            const descriptionSearch = removeAccentsAndSpaces(s.desc || "");
            const statusSearch = statusMap[s.status] || "";
            const readSearch = s.is_read ? "dadoc" : "chuadoc";
            return emailSearch.includes(normalizedTerm) || nameSearch.includes(normalizedTerm) || purposeSearch.includes(normalizedTerm) || statusSearch.includes(normalizedTerm) || readSearch.includes(normalizedTerm) || descriptionSearch.includes(normalizedTerm);
        });
        setResult(filteredSubmission);
        if (filteredSubmission.length === 0) {
            setErr("Không tìm thấy kết quả nào khớp chính xác!");
        } else {
            setErr("");
        }
    };

    const Readed = async (submissionId) => {
        const updateList = (list) =>
            list.map(s => String(s.id) === String(submissionId) ? { ...s, is_read: !s.is_read } : s);
        setSubmission(prev => updateList(prev));
        if (result) {
            setResult(prev => updateList(prev));
        }
        try {
            await submissionApi.readed(submissionId);
        } catch (error) {
            const revertList = (list) =>
                list.map(s => String(s.id) === String(submissionId) ? { ...s, is_read: !s.is_read } : s);
            setSubmission(prev => revertList(prev));
            if (result) {
                setResult(prev => revertList(prev));
            }
            handleApiError(error);
        }
    };

    const Delete = async (submissionId) => {
        setLoading(true);
        try {
            await submissionApi.delete(submissionId);
            const filterList = (list) => list.filter(s => String(s.id) !== String(submissionId));
            setSubmission(prev => filterList(prev));
            if (result) {
                setResult(prev => filterList(prev));
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleMore = (name, email, purpose, desc) => {
        if (more) {
            setMore(false);
            setPopup({ name: "", email: "", purpose: "", desc: "" })
        } else {
            setMore(true);
            setPopup({ name: name, email: email, purpose: purpose, desc: desc });
        }
    };

    const displayList = result ? result : submission;

    return (
        <section className="h-full relative max-w-[96%] mx-auto space-y-2">
            <div className='heading text-black p-2'>Câu hỏi</div>
            <div className='flex gap-2'>
                <div className='flex-1 text lg:block hidden'>
                    {err && (
                        <ErrorNoti err={err} />
                    )}
                </div>
                <div className="lg:w-[50%] flex gap-1">
                    <form onSubmit={handleLocalSearch} className='flex w-full'>
                        <button type='submit' disabled={loading} className='admin-button-search'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14" /></svg></button>
                        <input type='text' value={searchQuery} onChange={handleOnchange} placeholder='Tìm kiếm gì đó...' className='admin-input-search' />
                    </form>
                    <select name="status" value={status} onChange={StatusChange} className="admin-select">
                        <option value="">Tất cả</option>
                        <option value="rule">Điều khoản & dịch vụ</option>
                        <option value="contact">Liên hệ</option>
                        <option value="feedback">Phản hồi & góp ý</option>
                    </select>
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
                </div>
            )}
            {displayList.length > 0 && (
                <div className='border border-gray-800 rounded-md w-full h-[80vh] overflow-y-auto'>
                    <table className='w-full text-lg lg:text-base'>
                        <thead className="bg-gray-200 sticky top-0 z-10 shadow-[0_1px_0_0_black]">
                            <tr className="border-b border-black heading-body">
                                <th className="p-2 text-left">Tên & Email</th>
                                <th className="p-2 text-left hidden lg:table-cell">Ngày gửi</th>
                                <th className="p-2 text-left">Biểu mẫu</th>
                                <th className="p-2 text-left hidden lg:table-cell">Mục đích</th>
                                <th className="p-2 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayList.map((item, index) => {
                                const isLast = index === displayList.length - 1;
                                const labelMap = {
                                    'rule': 'Nội quy',
                                    'contact': 'Liên hệ',
                                    'feedback': 'Góp ý'
                                };
                                return (
                                    <tr key={item.id} ref={isLast ? lastRef : null} onClick={() => toggleMore(item.name, item.email, item.purpose, item.description)} className="border-b cursor-pointer text hover:bg-gray-50 transition-colors">
                                        <td className="p-2">
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-xs text-gray-500 lg:hidden">{item.email}</div>
                                            <div className="hidden lg:block text-xs text-gray-400">{item.email}</div>
                                        </td>
                                        <td className="p-2 hidden lg:table-cell">
                                            {new Date(item.created_at).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td className="p-2">
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] uppercase font-bold">
                                                {labelMap[item.status] || item.status}
                                            </span>
                                        </td>
                                        <td className="p-2 hidden lg:table-cell">
                                            {item.purpose}
                                        </td>
                                        <td className="p-2 text-center flex gap-2 justify-center items-center">
                                            <button onClick={(e) => { e.stopPropagation(); Readed(item.id); }} className={`lg:hidden block py-1 px-2 rounded cursor-pointer text-xs text-white ${item.is_read ? 'bg-green-400' : 'bg-gray-500'}`}>
                                                {item.is_read ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M10.81 2.34a2.25 2.25 0 0 1 2.38 0l7.75 4.833q.116.072.221.157L12 12.15L2.834 7.333q.107-.085.225-.16zM2.048 8.614A2.3 2.3 0 0 0 2 9.082v7.668A3.25 3.25 0 0 0 5.25 20h13.5A3.25 3.25 0 0 0 22 16.75V9.082q0-.241-.05-.472l-9.6 5.05a.75.75 0 0 1-.699.001z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" fillRule="evenodd" d="M3.172 5.172C2 6.343 2 8.229 2 12s0 5.657 1.172 6.828S6.229 20 10 20h4c3.771 0 5.657 0 6.828-1.172S22 15.771 22 12s0-5.657-1.172-6.828S17.771 4 14 4h-4C6.229 4 4.343 4 3.172 5.172M18.576 7.52a.75.75 0 0 1-.096 1.056l-2.196 1.83c-.887.74-1.605 1.338-2.24 1.746c-.66.425-1.303.693-2.044.693s-1.384-.269-2.045-.693c-.634-.408-1.352-1.007-2.239-1.745L5.52 8.577a.75.75 0 0 1 .96-1.153l2.16 1.799c.933.777 1.58 1.315 2.128 1.667c.529.34.888.455 1.233.455s.704-.114 1.233-.455c.547-.352 1.195-.89 2.128-1.667l2.159-1.8a.75.75 0 0 1 1.056.097" clipRule="evenodd" /></svg>}
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); Readed(item.id); }} className={`px-4 py-2 lg:block hidden rounded cursor-pointer text-xs text-white ${item.is_read ? 'bg-green-400' : 'bg-gray-500'}`}>
                                                {item.is_read ? "Đã đọc" : "Chưa đọc"}
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); Delete(item.id); }} disabled={loading} className="px-4 py-2 rounded cursor-pointer text-xs text-white bg-red-500" >
                                                Xoá
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            {more && (
                <div className="absolute inset-0 flex flex-col z-50">
                    <div className="bg-black/60 blur-3xl absolute inset-0" />
                    <div className=" bg-[#f5f5f3] flex-1 overflow-y-auto overflow-x-hidden rounded-md space-y-2 p-2 absolute h-[70vh] w-[80vw] lg:w-[60vw] top-[10%] left-[10%] lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
                        <div className="flex px-2 items-center justify-between w-full rounded-sm bg-[#191B1D] sticky inset-0">
                            <div className="">
                                <div className="font-inter font-bold text-gray-300">
                                    {popup.email}
                                </div>
                            </div>
                            <div className="">
                                <button type="button" onClick={toggleMore}><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.758 17.243L12.001 12m5.243-5.243L12 12m0 0L6.758 6.757M12.001 12l5.243 5.243" /></svg></button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="text font-bold">
                                {popup.purpose}
                            </div>
                            <div className="text whitespace-pre-wrap">
                                {popup.desc}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}