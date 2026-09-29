import userApi from "../api/userApi";
import authApi from "../api/authApi";
import collectionApi from "../api/collectionApi";
import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ErrorNoti from "./comon/Noti/Error";
import SuccessNoti from "./comon/Noti/Success";
import AnimatedSection from "./comon/Animation/AnimatedSection";
import AnimatedText from "./comon/Animation/AnimatedText";
import AnimatedTitle from "./comon/Animation/AnimatedTitle";
import LostConnection from "./LostConnection";

export default function AccountLayout({ style, link, content, noti, lang }) {
    const [more, setMore] = useState(false);
    const [create, setCreate] = useState(false);
    const [form, setForm] = useState({ name: '', state: true });
    const [succ, setSucc] = useState(null);
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadUI, setLoadUI] = useState(false);
    const [errorloadInfo, setErrLoadInfo] = useState(false);
    const [collection, setCollection] = useState([]);
    const [id, setId] = useState('');
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(null);
    const [info, setInfo] = useState(null);
    const [errUser, setErrUser] = useState(null);
    const [tag, setTag] = useState(null);
    const [mobile, setMobile] = useState(false);
    const [lock, setLock] = useState(null);
    const navigate = useNavigate();
    const { pathname: path } = useLocation();
    const [user, setUser] = useState("");

    const toggleMenu = () => {
        setMore(!more);
    };

    const logout = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            await authApi.logout();
            localStorage.removeItem('token');
            window.dispatchEvent(new Event("authChange"));
            if (path === "/account") {
                navigate('/');
            } else if (path === '/digital/account') {
                navigate('/digital');
            }
        } catch (error) {
            if (error.response?.status === 401) {
                setErr(noti.expired);
            } else if (error.request) {
                setErr(noti.server);
            } else {
                setErr(noti.undef);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchCollection = useCallback(async () => {
        const res = await collectionApi.getMine();
        setCollection(res?.data?.data);
    }, []);

    const getInfo = useCallback(async () => {
        const res = await userApi.get();
        setName(res?.data?.data?.full_name);
        setTag(res?.data?.data?.user_tag);
        setInfo(res?.data?.data?.info);
    }, []);

    const validateUser = (user) => {
        const value = user.trim();
        const match = value.match(/^(.+?)\s?#(\d{5})$/);
        if (match) {
            const [, name, tag] = match;
            return { name, tag };
        }
        setErrUser(noti.invaidUser);
        return null;
    };

    const searchUser = async (e) => {
        e.preventDefault();
        setErrUser(null);
        const userData = validateUser(user);
        if (!userData) return;
        const { name, tag } = userData;
        try {
            setLoading(true);
            const res = await userApi.getByTag(`${name}#${tag}`);
            const data = res?.data?.data;
            if (path === "/account") {
                navigate(`/user/${encodeURIComponent(`${name}#${tag}`)}`, { state: { infoUser: data } });
            } else if (path === '/digital/account') {
                navigate(`/digital/user/${encodeURIComponent(`${name}#${tag}`)}`, { state: { infoUser: data } });
            }
        } catch {
            setErrUser(noti.usernotfound);
        } finally {
            setLoading(false);
        }
    };

    const fetchData = useCallback(async () => {
        try {
            setLoadUI(true);
            setErrLoadInfo(false);
            await Promise.all(
                [
                    fetchCollection(),
                    getInfo()
                ]
            )
        } catch {
            setErrLoadInfo(true);
        } finally {
            setLoadUI(false);
        }
    }, [fetchCollection, getInfo]);

    useEffect(() => {
        const handleResize = () => {
            setMobile(window.innerWidth < 1024);
        };
        fetchData();
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [fetchData]);

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
        if (!form.name) {
            setErr(noti.null);
            return;
        }
        setLoading(true);
        setErr(null);
        setSucc(null);
        try {
            await collectionApi.create(form.name, form.state);
            await fetchCollection();
            setForm({ name: '', state: true });
            setSucc('Tạo thành công.');
            setTimeout(() => {
                setSucc(null);
                setEditing(false);
            }, 2000);
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    setErr(noti.expired)
                }
            } else if (error.request) {
                setErr(noti.server);
            } else {
                setErr(noti.undef);
            }
        } finally {
            setLoading(false);
        }
    };

    const editCollection = async (e) => {
        e.preventDefault();
        if (!form.name) {
            setErr(noti.null);
            return;
        }
        setLoading(true);
        setErr(null);
        setSucc(null);
        try {
            await collectionApi.update(id, form.name, form.state);
            await fetchCollection();
            setSucc(noti.succsess);
            setTimeout(() => {
                setSucc(null);
                setEditing(false);
            }, 2000);
        } catch (error) {
            console.log(form.state);
            if (error.response) {
                if (error.response.status === 401) {
                    setErr(noti.expired)
                }
            } else if (error.request) {
                setErr(noti.server);
            } else {
                setErr(err.undef);
            }
        } finally {
            setLoading(false);
        }
    };

    const deleteCollection = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await collectionApi.delete(id);
            setEditing(false);
            await fetchCollection();
        } catch {
            setErr(noti.undelete);
        } finally {
            setLoading(false);
        }
    };

    if (errorloadInfo) return (<LostConnection lang={lang} click={fetchData} />);
    if (loadUI) return (<div className={`h-screen -mt-4 ${style.heading} flex items-center justify-center`}>{lang === "vi" ? "Đang tải..." : "Loading..."}</div>);

    return (
        <div className="max-w-6xl flex flex-col mx-auto pb-10">
            <AnimatedSection className="space-y-4 order-3 pt-6">
                <div className="flex justify-between">
                    <AnimatedTitle className={style.heading}>
                        {content.title}
                    </AnimatedTitle>
                    <AnimatedTitle>
                        <button type="button" onClick={toggleCreate} className={`lg:block hidden ${style.heading} lg:text-xl text-lg font-bold ${style.text_color} ${style.button_bg_color} p-2 rounded-lg`}>{content.add}</button>
                        <button type="button" onClick={toggleCreate} className="lg:hidden block lg:text-xl text-lg font-bold rounded-lg"><svg width="24" height="24" role="img" viewBox="0 0 24 24" stroke={style.button_color} strokeWidth="2" strokeLinecap="round"><path d="M12 4V20M4 12H20" /></svg></button>
                    </AnimatedTitle>
                </div>
                <AnimatedText className={`${collection.length === 0 ? 'block' : 'hidden'} ${style.text} ${style.text_null_color} text-center`}>{content.null}</AnimatedText>
                <AnimatedText className={`${collection.length > 0 ? 'block' : 'hidden'} lg:px-0 px-2 grid lg:grid-cols-3 grid-cols-2 lg:gap-4 gap-2`}>
                    {collection.map((item) => (
                        <Link to={`collection/${item.id}`} key={item.id}>
                            <div className="lg:h-[36vh] h-[32vh] select-none relative border border-gray-800 rounded-md">
                                <img src="/User/img/No_Image.png" draggable={false} alt="Img" className={`${item.cover_image ? "hidden" : "block"} object-cover w-full h-full rounded-md `} />
                                <img src={item.cover_image} draggable={false} alt="Img" className={`${item.cover_image ? "block" : "hidden"} object-cover w-full h-full rounded-md `} />
                                <div className="absolute inset-0 bg-black/10" />
                                <div className={`${item.is_public ? "hidden" : "block"} absolute top-0 right-0 bg-black/60 rounded-tr-md rounded-bl-md`} onMouseEnter={!mobile ? () => setLock(item.id) : undefined} onMouseLeave={!mobile ? () => setLock(null) : undefined} onClick={mobile ? () => setLock(lock === item.id ? null : item.id) : undefined} >
                                    <img src="/User/icon/Lock.png" draggable={false} alt="Riêng tư" className=" w-10 h-auto" />
                                </div>
                                {lock === item.id && (
                                    <div className={`bg-black/20 absolute ${style.text} text-sm lg:top-2 lg:right-12 top-12 right-0 p-2 rounded-md text-white bg-black/60`}>{content.private1}<br />{content.private2}</div>
                                )}
                                <div className="absolute top-0 left-0 bg-black/60 rounded-tl-md rounded-br-md">
                                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleEdit(item) }} className="hover:bg-black/40 p-2 rounded-md"><img draggable={false} src="/User/icon/Edit.png" alt="Chỉnh sửa" className="w-6 h-auto "></img></button>
                                </div>
                                <div className={`${style.text} ${style.text_color_popup} absolute pointer-events-none inset-0 text-base flex justify-between items-end`}>
                                    <div className="text-white p-2 rounded-md bg-black/80">
                                        {item.item_count} {content.item}
                                    </div>
                                    <div className="text-white p-2 rounded-md bg-black/80">
                                        {formatDate(item.created_at)}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center px-2">
                                <div className={`${style.text} font-bold`}>
                                    {item.name}
                                </div>
                            </div>
                        </Link>
                    ))}
                </AnimatedText>
            </AnimatedSection>
            <AnimatedSection className="w-full flex lg:flex-row flex-col gap-4 justify-start lg:items-center pb-6 relative order-1">
                <AnimatedTitle className="lg:w-[40%] lg:order-1 order-2">
                    <form onSubmit={searchUser} className="flex lg:gap-2 gap-1">
                        <input type="text" placeholder={content.searchUser} className={`w-full ${style.input}`} name="user" value={user} onChange={(e) => { setUser(e.target.value); setErrUser(null); }} />
                        <button type="submit" disabled={loading} className={` font-bold ${style.text_color} ${style.button_bg_color} px-4 py-2 rounded-lg`}><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                            <path d="M0 0h24v24H0z" fill="none" />
                            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21l-4.486-4.494M19 10.5a8.5 8.5 0 1 1-17 0a8.5 8.5 0 0 1 17 0Z" />
                        </svg>
                        </button>
                    </form>
                    {errUser && (<ErrorNoti err={errUser} />)}
                </AnimatedTitle>
                <AnimatedTitle className="lg:order-2 order-1 flex gap-2 justify-end items-center flex-1">
                    <div className={`${style.heading} lg:text-3xl text-xl`}>
                        {content.hi} {name ?? (lang === "vi" ? "người dùng" : "user")} #{tag}
                    </div>
                    <div className="">
                        <button type="button" onClick={toggleMenu} className="lg:hover:bg-black/20 transform-all duration-300 ease-out p-2 rounded-lg"><svg height="14" role="img" viewBox="0 0 24 24" width="14"><path d="M23.7 8.7 12 20.42.3 8.71l1.4-1.42L12 17.6 22.3 7.3z" fill={style.button_color}></path></svg></button>
                    </div>
                </AnimatedTitle>
                {more && (
                    <div className={`absolute z-10 lg:left-auto lg:right-0 lg:top-[60%] left-0 top-[45%] flex flex-col rounded-md gap-2 items-start py-4 px-6  border ${style.bg1} border-gray-800 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200`}>
                        <Link to={link.edit} className={`hover:bg-black/20 transform-all duration-300 ease-out w-full rounded-md ${style.text_color_popup} ${style.text}`}>{content.link1}</Link>
                        <Link to={link.editInfo} className={`hover:bg-black/20 transform-all duration-300 ease-out w-full rounded-md ${style.text_color_popup} ${style.text}`}>{content.link4}</Link>
                        <Link to={link.interaction} className={`hover:bg-black/20 transform-all duration-300 ease-out w-full rounded-md ${style.text_color_popup} ${style.text}`}>{content.link2}</Link>
                        <button type="button" onClick={logout} disabled={loading} className={`hover:bg-black/20 transform-all duration-300 ease-out w-full ${style.text_color_popup} text-red-600 rounded-md text-left font-bold ${style.text}`}>{content.link3}</button>
                    </div>
                )}
            </AnimatedSection>
            <AnimatedSection className={`order-2 rounded-lg border ${style.border} p-6 md:p-8`}>
                <AnimatedTitle className="grid grid-cols-1 md:grid-cols-2">
                    <AnimatedText className={`border-b ${style.border} p-4 md:border-r`}>
                        <div className={`text-xs font-medium uppercase tracking-[0.2em] opacity-80 ${style.textColor}`}>
                            {content.nickname}
                        </div>
                        <div className={`${style.text} mt-2 text-lg`}>
                            {info?.nickName}
                        </div>
                    </AnimatedText>
                    <AnimatedText className={`border-b ${style.border} p-4 md:pl-6`}>
                        <div className={`text-xs font-medium uppercase tracking-[0.2em] opacity-80 ${style.textColor}`}>
                            {content.birthday}
                        </div>
                        <div className={`${style.text} mt-2 text-lg`}>
                            {info?.birthday}
                        </div>
                    </AnimatedText>
                    <AnimatedText className={`border-b ${style.border} p-4 md:border-r`}>
                        <div className={`text-xs font-medium uppercase tracking-[0.2em] opacity-80 ${style.textColor}`}>
                            Email
                        </div>
                        <div className={`${style.text} mt-2 text-lgbreak-all`}>
                            {info?.email}
                        </div>
                    </AnimatedText>
                    <AnimatedText className={`border-b ${style.border} p-4 md:pl-6`}>
                        <div className={`text-xs font-medium uppercase tracking-[0.2em] opacity-80 ${style.textColor}`}>
                            {content.hobby}
                        </div>
                        <div className={`${style.text} mt-2 text-lg`}>
                            {info?.hobby}
                        </div>
                    </AnimatedText>
                    <AnimatedText className="col-span-full p-4 pt-6">
                        <div className={`text-xs font-medium uppercase tracking-[0.2em] opacity-80 ${style.textColor}`}>
                            {content.description}
                        </div>
                        <div className={`${style.text} mt-3 max-w-3xl leading-relaxed`}>
                            {info?.description}
                        </div>
                    </AnimatedText>
                </AnimatedTitle>
            </AnimatedSection>
            <div className={`${create ? "block" : "hidden"} bg-black/20 absolute inset-0`} />
            {create && (
                <AnimatedSection className={`absolute z-50 lg:top-[40%] top-[30%] left-1/2 -translate-x-1/2`}>
                    <form onSubmit={createCollection} className={` p-2 lg:space-y-4 lg:w-[50vw] w-[90vw] h-auto flex flex-col gap-4 border border-gray-800 shadow-2xl ${style.bg2}`}>
                        <div className="flex justify-between items-center">
                            <div className={`${style.heading} ${style.text_color_popup} lg:text-3xl flex-1 px-2`}>
                                {content.create}
                            </div>
                            <div className="w-10">
                                <button type="button" onClick={toggleCreate} className="hover:bg-black/20 transform-all duration-300 ease-out p-2 rounded-md"><svg width="30" height="30" viewBox="0 0 24 24"><path d="M7.4 6L6 7.4L10.6 12L6 16.6L7.4 18L12 13.4L16.6 18L18 16.6L13.4 12L18 7.4L16.6 6L12 10.6Z" /></svg></button>
                            </div>
                        </div>
                        <div className="lg:grid lg:grid-cols-[1fr_70%] grid-rows-2 lg:gap-2">
                            <div className={`${style.heading} ${style.text_color_popup}  text-lg lg:text-2xl`}>
                                {content.name}
                            </div>
                            <div className="">
                                <input className={style.input} type="text" name="name" onChange={handleOnchange} value={form.name} placeholder={content.name} />
                            </div>
                            <div className={`${style.heading} ${style.text_color_popup}  text-lg lg:text-2xl lg:pt-0 pt-2`}>
                                {content.state}
                            </div>
                            <div className="">
                                <select name="state" value={form.state.toString()} onChange={(e) =>
                                    setForm({
                                        ...form,
                                        state: e.target.value === "true"
                                    })} className={`bg-inherit ${style.text} ${style.text_color_popup} p-2 border-[2px] rounded-md border-gray-800`}>
                                    <option value="true" className={style.bg2}>{content.option1}</option>
                                    <option value="false" className={style.bg2}>{content.option2}</option>
                                </select>
                            </div>
                        </div>
                        <div className="lg:flex hidden items-center justify-center">
                            <div className="flex-1">
                                {err && (<ErrorNoti err={err} />)}
                                {succ && (<SuccessNoti succ={succ} />)}
                            </div>
                            <div className="flex-1 text-right">
                                <button type="submit" disabled={loading} className={`${style.heading} text-lg font-bold text-white ${style.button_bg_popup_color} p-2 rounded-lg`}>{content.confirm}</button>
                            </div>
                        </div>
                        <div className="block lg:hidden">
                            <div className="text-right">
                                <button type="submit" disabled={loading} className={`${style.heading} text-lg font-bold text-white ${style.button_bg_popup_color} p-2 rounded-lg`}>{content.confirm}</button>
                            </div>
                            <div className="">
                                {err && (<ErrorNoti err={err} />)}
                                {succ && (<SuccessNoti succ={succ} />)}
                            </div>
                        </div>
                    </form>
                </AnimatedSection>
            )}
            <div className={`${editing ? 'block' : 'hidden'} bg-black/20 absolute inset-0`} />
            {editing && (
                <AnimatedSection className={`absolute z-50 lg:space-y-4 lg:top-[40%] top-[30%] left-1/2 -translate-x-1/2`}>
                    <form onSubmit={editCollection} className={`p-2 space-x-2 lg:w-[50vw] w-[90vw] h-auto flex flex-col gap-4  border border-gray-800 shadow-2xl ${style.bg2}`}>
                        <div className="flex justify-between items-center">
                            <div className={`${style.heading} ${style.text_color_popup} lg:text-3xl flex-1 px-2`}>
                                {content.edit}
                            </div>
                            <div className="w-10">
                                <button type="button" onClick={() => toggleEdit(null)} className=" hover:bg-black/20 transform-all duration-300 ease-out p-2 rounded-md"><svg width="30" height="30" viewBox="0 0 24 24"><path d="M7.4 6L6 7.4L10.6 12L6 16.6L7.4 18L12 13.4L16.6 18L18 16.6L13.4 12L18 7.4L16.6 6L12 10.6Z" /></svg></button>
                            </div>
                        </div>
                        <div className="lg:grid lg:grid-cols-[1fr_70%] lg:grid-rows-2 lg:gap-2">
                            <div className={`${style.heading} ${style.text_color_popup} text-lg lg:text-2xl`}>
                                {content.name}
                            </div>
                            <div className="">
                                <input className={style.input} type="text" value={form.name} name="name" onChange={handleOnchange} placeholder={content.name} />
                            </div>
                            <div className={`${style.heading} ${style.text_color_popup} text-lg lg:text-2xl lg:pt-0 pt-2`}>
                                {content.state}
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
                                        <option value="true" className={style.bg2}>{content.option1}</option>
                                        <option value="false" className={style.bg2}>{content.option2}</option>
                                    </select>
                                </div>
                                <div className="lg:block hidden">
                                    <button type="button" disabled={loading} onClick={deleteCollection} className={`${style.heading} text-lg font-bold text-white bg-[#c60000] py-2 px-8 rounded-lg`}>{content.delete}</button>
                                </div>
                            </div>
                        </div>
                        <div className="lg:flex hidden items-center justify-center">
                            <div className="flex-1">
                                {err && (<ErrorNoti err={err} />)}
                                {succ && (<SuccessNoti succ={succ} />)}
                            </div>
                            <div className="flex-1 text-right">
                                <button type="submit" disabled={loading} className={`${style.heading} text-lg font-bold text-white ${style.button_bg_popup_color} p-2 rounded-lg`}>{content.confirm}</button>
                            </div>
                        </div>
                        <div className="block lg:hidden">
                            <div className="flex justify-between">
                                <div className="">
                                    <button type="button" disabled={loading} onClick={deleteCollection} className={`${style.heading} text-lg font-bold text-white bg-[#c60000] py-2 px-8 rounded-lg`}>{content.delete}</button>
                                </div>
                                <div className="text-right">
                                    <button type="submit" disabled={loading} className={`${style.heading} text-lg font-bold text-white ${style.button_bg_popup_color} p-2 rounded-lg`}>{content.confirm}</button>
                                </div>
                            </div>
                            <div className="">
                                {err && (<ErrorNoti err={err} />)}
                                {succ && (<SuccessNoti succ={succ} />)}
                            </div>
                        </div>
                    </form>
                </AnimatedSection>
            )}
        </div >
    )
}