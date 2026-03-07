import apiClient from "../../api/axiosClient";
import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import ErrorNoti from "../comon/Noti/Error";
import AnimatedSection from "../comon/Animation/AnimatedSection";
import AnimatedText from "../comon/Animation/AnimatedText";
import AnimatedTitle from "../comon/Animation/AnimatedTitle";


export default function Account({ style, link }) {
    const [more, setMore] = useState(false);
    const [create, setCreate] = useState(false);
    const [form, setForm] = useState({ name: '', state: true });
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);
    const [collection, setCollection] = useState([]);
    const [id, setId] = useState('');
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState('null');
    const [mobile, setMobile] = useState(false);
    const [lock, setLock] = useState(null);
    const navigate = useNavigate();
    const [path, setPath] = useState(window.location.pathname);

    const toggleMenu = () => {
        setMore(!more);
    };

    const logout = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        setLoading(true)
        try {
            await apiClient.post('http://localhost:5000/api/auth/logout',
                {},
                {
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                });
            localStorage.removeItem('token');
            window.dispatchEvent(new Event("authChange"));
            if (path === "/account") {
                navigate('/');
            } else if (path === '/digital/account') {
                navigate('/digital');
            }
        } catch (error) {
            console.log('Có lỗi khi đăng xuất!', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCollection = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await apiClient.get(
                'http://localhost:5000/api/Collection/mine',
                {
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                }
            );
            setCollection(res.data.data);
        } catch (error) {
            setCollection([]);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setMobile(window.innerWidth < 1024);
        };
        const userName = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await apiClient.get(
                    "http://localhost:5000/api/user",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setName(res.data.data.full_name);
            } catch (error) {
                setName('null');
                console.error('Đã có lỗi xảy ra khi lấy profile!', error.response?.data || error.message);
            }
        };
        userName();
        fetchCollection();
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const handleOnchange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    };

    const toggleCreate = () => {
        setCreate(!create);
    };

    const toggleEdit = (item) => {
        if (item) {
            setForm({
                name: item.name,
                state: item.is_public
            });
            setId(item.id);
            setEditing(true);
        } else {
            setEditing(false);
        }
    };

    useEffect(() => {
        if (create || editing) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [create, editing]);

    const createCollection = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!form.name) {
            setErr('Vui lòng nhập tên bộ sưu tập!');
            return;
        }
        setLoading(true);
        setErr('');
        try {
            await apiClient.post(
                "http://localhost:5000/api/collection",
                {
                    name: form.name,
                    rawPublic: form.state
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            await fetchCollection();
            setCreate(false);
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    setErr("Đăng nhập hết hạn, vui lòng đăng nhập lại!")
                }
            } else if (error.request) {
                setErr("Không thể kết nối đến Server!");
            } else {
                setErr("Đã có lỗi xảy ra!");
            }
        } finally {
            setLoading(false);
        }
    };

    const editCollection = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!form.name) {
            setErr('Vui lòng nhập tên bộ sưu tập!');
            return;
        }
        setLoading(true);
        setErr('');
        try {
            await apiClient.patch(
                `http://localhost:5000/api/collection/${id}`,
                {
                    name: form.name,
                    rawPublic: form.state
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            await fetchCollection();
            setEditing(false);
        } catch (error) {
            console.log(form.state);
            if (error.response) {
                if (error.response.status === 401) {
                    setErr("Đăng nhập hết hạn, vui lòng đăng nhập lại!")
                }
            } else if (error.request) {
                setErr("Không thể kết nối đến Server!");
            } else {
                setErr("Đã có lỗi xảy ra!");
            }
        } finally {
            setLoading(false);
        }
    };

    const deleteCollection = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        setLoading(true);
        try {
            await apiClient.delete(`http://localhost:5000/api/collection/${id}`, {
                headers: {
                    authorization: `Bearer ${token}`
                }
            });
            setEditing(false);
            await fetchCollection();
        } catch (error) {
            setErr('Không thể xoá, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl flex flex-col mx-auto">
            <AnimatedSection className="space-y-4 order-2 pb-10">
                <AnimatedTitle className={style.heading}>
                    Bộ sưu tập của bạn
                </AnimatedTitle>
                <AnimatedText className={`${collection.length === 0 ? 'block' : 'hidden'} ${style.text} ${style.text_null_color} text-center`}>Bạn chưa có bộ sưu tập nào, Tạo ngay...</AnimatedText>
                <AnimatedText className={`${collection.length > 0 ? 'block' : 'hidden'} lg:px-0 px-2 grid lg:grid-cols-3 grid-cols-2 lg:gap-4 gap-2`}>
                    {collection.map((item) => (
                        <div key={item.id} className="">
                            <div className="lg:h-[36vh] h-[32vh] select-none relative border border-gray-800 rounded-md">
                                <img src="/User/img/No_Image.png" draggable={false} alt="Img" className={`${item.cover_image ? "hidden" : "block"} object-cover w-full h-full rounded-md `} />
                                <img src={item.cover_image} draggable={false} alt="Img" className={`${item.cover_image ? "block" : "hidden"} object-cover w-full h-full rounded-md `} />
                                <div className="absolute inset-0 bg-black/10" />
                                <div className={`${item.is_public ? "hidden" : "block"} absolute top-0 right-0 bg-black/60 rounded-tr-md rounded-bl-md`} onMouseEnter={!mobile ? () => setLock(item.id) : undefined} onMouseLeave={!mobile ? () => setLock(null) : undefined} onClick={mobile ? () => setLock(lock === item.id ? null : item.id) : undefined} >
                                    <img src="/User/icon/Lock.png" draggable={false} alt="Riêng tư" className=" w-10 h-auto" />
                                </div>
                                {lock === item.id && (
                                    <div className={`bg-black/20 absolute ${style.text} text-sm lg:top-2 lg:right-12 top-12 right-0 p-2 rounded-md backdrop-blur-md`}>Bộ sưu tập này là riêng tư,<br /> chỉ có bạn mới xem được.</div>
                                )}
                                <div className="absolute top-0 left-0 bg-black/60 rounded-tl-md rounded-br-md">
                                    <button type="button" onClick={() => toggleEdit(item)} className="hover:bg-black/40 p-2 rounded-md"><img draggable={false} src="/User/icon/Edit.png" alt="Chỉnh sửa" className="w-6 h-auto "></img></button>
                                </div>
                                <div className={`${style.text} ${style.text_color_popup} absolute pointer-events-none inset-0 text-base flex justify-between items-end px-2`}>
                                    <div className="backdrop-blur-md">
                                        {item.item_count} ghim
                                    </div>
                                    <div className="backdrop-blur-md">
                                        {formatDate(item.created_at)}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center px-2">
                                <div className={`${style.text} font-bold`}>
                                    {item.name}
                                </div>
                            </div>
                        </div>
                    ))}
                </AnimatedText>
            </AnimatedSection>
            <AnimatedSection className="flex lg:gap-0 gap-2 px-2 lg:px-0 justify-between items-center relative pb-10 order-1">
                <AnimatedTitle className="lg:order-1 order-2">
                    <button type="button" onClick={toggleCreate} className={`lg:block hidden ${style.heading} lg:text-xl text-lg font-bold ${style.text_color} ${style.button_bg_color} p-2 rounded-lg`}>Tạo</button>
                    <button type="button" onClick={toggleCreate} className="lg:hidden block lg:text-xl text-lg font-bold rounded-lg"><svg width="24" height="24" role="img" viewBox="0 0 24 24" stroke={style.button_color} strokeWidth="2" strokeLinecap="round"><path d="M12 4V20M4 12H20" /></svg></button>
                </AnimatedTitle>
                <AnimatedTitle className="lg:order-2 order-1 flex gap-2 justify-center items-center">
                    <div className={`${style.heading} lg:text-3xl text-2xl`}>
                        Xin chào {name}
                    </div>
                    <div className="">
                        <button type="button" onClick={toggleMenu} className="lg:hover:bg-black/20 transform-all duration-300 ease-out p-2 rounded-lg"><svg height="14" role="img" viewBox="0 0 24 24" width="14"><path d="M23.7 8.7 12 20.42.3 8.71l1.4-1.42L12 17.6 22.3 7.3z" fill={style.button_color}></path></svg></button>
                    </div>
                </AnimatedTitle>
                {more && (
                    <div className={`absolute lg:left-auto lg:right-0 lg:top-[60%] left-0 top-[45%] flex flex-col rounded-md gap-2 items-start py-4 px-6  border ${style.bg1} border-gray-800 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200`}>
                        <Link to={link.edit} className={`hover:bg-black/20 transform-all duration-300 ease-out w-full rounded-md ${style.text_color_popup} ${style.text}`}>Chỉnh sửa hồ sơ cá nhân</Link>
                        <Link to="#" className={`hover:bg-black/20 transform-all duration-300 ease-out w-full rounded-md ${style.text_color_popup} ${style.text}`}>Tác phẩm & sự kiện đã tương tác</Link>
                        <button type="button" onClick={logout} disabled={loading} className={`hover:bg-black/20 transform-all duration-300 ease-out w-full ${style.text_color_popup} rounded-md text-left font-bold ${style.text}`}>Đăng xuất</button>
                    </div>
                )}
            </AnimatedSection>
            <div className={`${create ? "block" : "hidden"} bg-black/20 absolute inset-0`} />
            {create && (
                <AnimatedSection className={`absolute z-50 p-2 lg:space-y-4 lg:w-[50vw] w-[90vw] h-auto flex flex-col gap-4 border border-gray-800 shadow-2xl ${style.bg2} lg:top-[40%] top-[30%] left-1/2 -translate-x-1/2`}>
                    <div className="flex justify-between items-center">
                        <div className={`${style.heading} ${style.text_color_popup} lg:text-3xl flex-1 px-2`}>
                            Tạo bộ sưu tập
                        </div>
                        <div className="w-10">
                            <button type="button" onClick={toggleCreate} className=" hover:bg-black/20 transform-all duration-300 ease-out p-2 rounded-md"><svg width="30" height="30" viewBox="0 0 24 24"><path d="M7.4 6L6 7.4L10.6 12L6 16.6L7.4 18L12 13.4L16.6 18L18 16.6L13.4 12L18 7.4L16.6 6L12 10.6Z" /></svg></button>
                        </div>
                    </div>
                    <div className="lg:grid lg:grid-cols-[1fr_70%] grid-rows-2 lg:gap-2">
                        <div className={`${style.heading} ${style.text_color_popup}  text-lg lg:text-2xl`}>
                            Tên bộ sưu tập
                        </div>
                        <div className="">
                            <input className={style.input} type="text" name="name" onChange={handleOnchange} value={form.name} placeholder="Tên bộ sưu tập" />
                        </div>
                        <div className={`${style.heading} ${style.text_color_popup}  text-lg lg:text-2xl lg:pt-0 pt-2`}>
                            Trạng thái
                        </div>
                        <div className="">
                            <select name="state" value={form.state.toString()} onChange={(e) =>
                                setForm({
                                    ...form,
                                    state: e.target.value === "true"
                                })} className={`bg-inherit ${style.text} ${style.text_color_popup} p-2 border-[2px] rounded-md border-gray-800`}>
                                <option value="true">Công khai</option>
                                <option value="false">Riêng tư</option>
                            </select>
                        </div>
                    </div>
                    <div className="lg:flex hidden items-center justify-center">
                        <div className="flex-1">
                            {err && (<ErrorNoti err={err} />)}
                        </div>
                        <div className="flex-1 text-right">
                            <button type="button" disabled={loading} onClick={createCollection} className={`${style.heading} text-lg font-bold text-white ${style.button_bg_popup_color} p-2 rounded-lg`}>Xác nhận</button>
                        </div>
                    </div>
                    <div className="block lg:hidden">
                        <div className="text-right">
                            <button type="button" disabled={loading} onClick={createCollection} className={`${style.heading} text-lg font-bold text-white ${style.button_bg_popup_color} p-2 rounded-lg`}>Xác nhận</button>
                        </div>
                        <div className="">
                            {err && (<ErrorNoti err={err} />)}
                        </div>
                    </div>
                </AnimatedSection>
            )}
            <div className={`${editing ? 'block' : 'hidden'} bg-black/20 absolute inset-0`} />
            {editing && (
                <AnimatedSection className={`absolute z-50 p-2 lg:space-y-4 space-x-2 lg:w-[50vw] w-[90vw] h-auto flex flex-col gap-4 border border-gray-800 shadow-2xl ${style.bg2} lg:top-[40%] top-[30%] left-1/2 -translate-x-1/2`}>
                    <div className="flex justify-between items-center">
                        <div className={`${style.heading} ${style.text_color_popup} lg:text-3xl flex-1 px-2`}>
                            Chỉnh sửa
                        </div>
                        <div className="w-10">
                            <button type="button" onClick={() => toggleEdit(null)} className=" hover:bg-black/20 transform-all duration-300 ease-out p-2 rounded-md"><svg width="30" height="30" viewBox="0 0 24 24"><path d="M7.4 6L6 7.4L10.6 12L6 16.6L7.4 18L12 13.4L16.6 18L18 16.6L13.4 12L18 7.4L16.6 6L12 10.6Z" /></svg></button>
                        </div>
                    </div>
                    <div className="lg:grid lg:grid-cols-[1fr_70%] lg:grid-rows-2 lg:gap-2">
                        <div className={`${style.heading} ${style.text_color_popup} text-lg lg:text-2xl`}>
                            Tên bộ sưu tập
                        </div>
                        <div className="">
                            <input className={style.input} type="text" value={form.name} name="name" onChange={handleOnchange} placeholder="Tên bộ sưu tập" />
                        </div>
                        <div className={`${style.heading} ${style.text_color_popup} text-lg lg:text-2xl lg:pt-0 pt-2`}>
                            Trạng thái
                        </div>
                        <div className="lg:flex justify-between items-center">
                            <div className="">
                                <select name="state" value={form.state ? "true" : "false"}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            state: e.target.value === "true"
                                        })}
                                    className={`bg-inherit ${style.text} ${style.text_color_popup} p-2 border-[2px] rounded-md border-gray-800`}>
                                    <option value="true">Công khai</option>
                                    <option value="false">Riêng tư</option>
                                </select>
                            </div>
                            <div className="lg:block hidden">
                                <button type="button" disabled={loading} onClick={deleteCollection} className={`${style.heading} text-lg font-bold text-white bg-[#c60000] py-2 px-8 rounded-lg`}>Xoá</button>
                            </div>
                        </div>
                    </div>
                    <div className="lg:flex hidden items-center justify-center">
                        <div className="flex-1">
                            {err && (<ErrorNoti err={err} />)}
                        </div>
                        <div className="flex-1 text-right">
                            <button type="button" disabled={loading} onClick={editCollection} className={`${style.heading} text-lg font-bold text-white ${style.button_bg_popup_color} p-2 rounded-lg`}>Xác nhận</button>
                        </div>
                    </div>
                    <div className="block lg:hidden">
                        <div className="flex justify-between">
                            <div className="">
                                <button type="button" disabled={loading} onClick={deleteCollection} className={`${style.heading} text-lg font-bold text-white bg-[#c60000] py-2 px-8 rounded-lg`}>Xoá</button>
                            </div>
                            <div className="text-right">
                                <button type="button" disabled={loading} onClick={editCollection} className={`${style.heading} text-lg font-bold text-white ${style.button_bg_popup_color} p-2 rounded-lg`}>Xác nhận</button>
                            </div>
                        </div>
                        <div className="">
                            {err && (<ErrorNoti err={err} />)}
                        </div>
                    </div>
                </AnimatedSection>
            )}
        </div >
    )
}