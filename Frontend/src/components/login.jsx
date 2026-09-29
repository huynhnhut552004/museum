import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import authApi from "../api/authApi";
import { motion, AnimatePresence } from "framer-motion";
import ErrorNoti from "./comon/Noti/Error";
import SuccessNoti from "./comon/Noti/Success";

export default function LoginLayout({ style, animate, content, noti }) {
    const [view, setView] = useState('login');
    const [showPass, setShowPass] = useState({ passLogin: false, passForget: false, passRegister: false, confPassRegister: false });
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);
    const [login, setLogin] = useState({ email: "", password: "" });
    const [reset, setReset] = useState({ otp: "", newPassword: "" });
    const [email, setEmail] = useState({ email: "" });
    const [register, setRegister] = useState({ name: "", email: "", password: "", confirm: "" });
    const [err, setErr] = useState(null);
    const [waring, setWaring] = useState(false);
    const [succ, setSucc] = useState(null);
    const [mobile, setMobile] = useState(false);
    const [loading, setLoading] = useState(false);
    const { pathname: path } = useLocation();

    useEffect(() => {
        const handleResize = () => {
            setMobile(window.innerWidth < 1024);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const slideAnimation = {
        initial: { x: 600, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -600, opacity: 0 },
        transition: {
            duration: 0.3,
            ease: "easeInOut"
        }
    };

    const toggleShowPass = (field) => {
        setShowPass(prevState => ({
            ...prevState,
            [field]: !prevState[field]
        }));
    };

    const LoginChange = (e) => {
        setLogin({
            ...login,
            [e.target.name]: e.target.value
        });
        if (err) setErr(null);
    };
    const sendOtpChange = (e) => {
        setEmail({
            ...email,
            [e.target.name]: e.target.value
        });
        if (err) setErr(null);
    };

    const resetPassChange = (e) => {
        setReset({
            ...reset,
            [e.target.name]: e.target.value
        });
        if (err) setErr(null);
    };

    const registerChange = (e) => {
        setRegister({
            ...register,
            [e.target.name]: e.target.value
        });
        if (err) setErr(null);
    };

    const sendOtp = async (e) => {
        e.preventDefault();
        if (!email.email) {
            setErr(noti.lackdata);
            return;
        }
        setLoading(true);
        setVisible(true);
        setErr(null);
        setSucc(null);
        try {
            await authApi.forgotPassword(email.email);
        } catch (error) {
            if (error.request) {
                setErr(noti.server);
            } else {
                setErr(noti.undef);
            }
        } finally {
            setLoading(false);
        }
    };

    const resetPass = async (e) => {
        e.preventDefault();
        if (!reset.otp || !reset.newPassword) {
            setErr(noti.lackdata);
            return;
        }
        setLoading(true);
        setErr(null);
        setSucc(null);
        try {
            await authApi.resetPassword(email.email, reset.otp, reset.newPassword);
            setSucc(noti.successpass);
            setTimeout(() => {
                setView('login');
            }, 2000);
        } catch (error) {
            if (error.response) {
                const { status, data } = error.response;
                if (status === 400 && data.message.includes('Mật khẩu yếu.')) {
                    setErr(noti.weakpass);
                } else if (status === 400 && data.message.includes('Không đúng định dạng.')) {
                    setErr(noti.invalidemail);
                } else if (status === 401) {
                    setErr(noti.invalidotp);
                } else {
                    setErr(noti.undef);
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

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!register.name || !register.email || !register.password || !register.confirm) {
            setErr(noti.lackdata);
            return;
        }
        if (register.name.length > 20) {
            setErr(noti.tolong);
            return;
        }
        if (register.password != register.confirm) {
            setErr(noti.notmatch);
            return;
        }
        setLoading(true);
        setErr(null);
        setSucc(null);
        try {
            await authApi.register(register.email, register.password, register.name);
            setSucc(noti.successregister);
            setTimeout(() => {
                setView('login');
            }, 2000);
        } catch (error) {
            if (error.response) {
                const { status, data } = error.response;
                if (status === 409) {
                    setErr(noti.duplicate);
                } else if (status === 400 && data.message.includes('Mật khẩu yếu.')) {
                    setErr(noti.weakpass);
                } else if (status === 400) {
                    setErr(noti.invalidemail);
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

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!login.email || !login.password) {
            setErr(noti.lackdata);
            return;
        }
        setLoading(true);
        setErr(null);
        setSucc(null);
        try {
            const res = await authApi.login(login.email, login.password);
            localStorage.setItem('token', res.data.data.accessToken);
            localStorage.setItem('role', res.data.data.user.role);
            if (path === '/login') {
                navigate('/');
            } else if (path === '/digital/login') {
                navigate('/digital');
            }
        } catch (error) {
            if (error.response) {
                const mess = error?.response?.data?.message;
                const [code, value] = mess.split("|");
                const status = error?.response?.status;
                if (status === 401 && mess.includes('Tài khoản của bạn đã bị khóa')) {
                    setErr(noti.ban);
                } else if (code === "BAN_1") {
                    setErr(noti.ban1.replace("{minute}", value));
                } else if (code === "BAN_2") {
                    setErr(noti.ban2)
                } else if (code === "TRY") {
                    setErr(noti.try.replace("{count}", value));
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

    return (
        <div className={`${style.bg} text-black min-h-screen flex items-center overflow-hidden justify-center relative`}>
            <Link to={style.back} className={`absolute ${style.backcolor} top-8 left-8 md:text-4xl text-2xl underline md:no-underline font-josefin hover:underline duration-300 ease-in-out`}>← {content.back}</Link>
            <style>{`
                    input::-ms-reveal,
                    input::-ms-clear {
                        display: none;
                    }
                    input::placeholder {
                        color: #6b7280;
                    }
                `}</style>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                {animate.map((item, index) => (
                    <div key={index} className={item.class} />
                ))}
            </div>
            <div className=" w-full max-w-md min-h-[500px] md:min-h-[450px] md:px-0 px-4 bg-non flex flex-col ">
                <AnimatePresence mode="wait">
                    {/* ----------------------------------------------------------------------------LOGIN-------------------------------------------------------------------------------- */}
                    {view === 'login' && (
                        <motion.div key="login" {...slideAnimation} className="w-full">
                            <div className={`${style.heading}`}>{content.login}</div>
                            {err && (
                                <ErrorNoti err={err} />
                            )}
                            <form onSubmit={handleLogin} className="mt-6">
                                <div className="space-y-1">
                                    <label className={`${style.label}`}>{content.nameaccount}</label>
                                    <input type="email" name="email" placeholder="abcd@gmail.com" value={login.email} onChange={LoginChange} className={`${style.input}`}></input>
                                </div>
                                <div className="space-y-1 mt-8 relative">
                                    <label className={`${style.label}`}>{content.pass}</label>
                                    <input type={showPass.passLogin ? "text" : "password"} placeholder="123456xyz" name="password" value={login.password} onChange={LoginChange} className={`${style.input}`}></input>
                                    <button onClick={() => toggleShowPass('passLogin')} className="rounded-md p-1 absolute left-[90%] top-[46%]" type="button">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12C4.8 8.2 8.1 6.5 12 6.5s7.2 1.7 9.5 5.5c-2.3 3.8-5.6 5.5-9.5 5.5S4.8 15.8 2.5 12z" /><circle cx="12" cy="12" r="2.4" /></svg>
                                    </button>
                                </div>
                                <div className="mt-8">
                                    <button type="submit" disabled={loading} className={`${style.button}`}>{content.login}</button>
                                </div>
                            </form>
                            <div className="flex -mt-9 gap-6">
                                <img src="/User/icon/Facebook_color.png" alt="Facebook" className="w-10 h-auto" />
                                <img src="/User/icon/Google.png" alt="Google" className="w-10 h-auto cursor-pointer" />
                                <img src="/User/icon/X.png" alt="Google" className={`w-10 h-auto cursor-pointer ${style.icon} `} />
                                <img src="/User/icon/Apple.png" alt="Google" className={`w-10 h-auto cursor-pointer ${style.icon}`} />
                            </div>
                            <div className="font-josefin text-gray-500 mt-6 pl-2 space-y-2">
                                <button onClick={() => { setView('forgot'); setErr(null); setSucc(null); }} className="underline block hover:text-black transition-all duration-300 ease-in-out">{content.forget}</button>
                                <button onClick={() => { setView('register'); setErr(null); setSucc(null); }} className="underline block hover:text-black transition-all duration-300 ease-in-out">{content.donthave}</button>
                            </div>
                        </motion.div>
                    )}
                    {/* ----------------------------------------------------------------------------FORGET PASSWORD-------------------------------------------------------------------------------- */}
                    {view === "forgot" && (
                        <motion.div key="forgot" {...slideAnimation} className="w-full relative">
                            <div className={`${style.heading}`}>{content.changepass}</div>
                            {err && (
                                <ErrorNoti err={err} />
                            )}
                            {succ && (
                                <SuccessNoti succ={succ} />
                            )}
                            <form className="mt-10 space-y-1" onSubmit={sendOtp}>
                                <label className={`${style.label}`}>{content.email}</label><br></br>
                                <div className="flex gap-2 items-center">
                                    <div className="md:w-[70%] w-[60%]">
                                        <input type="email" name="email" value={email.email} onChange={sendOtpChange} placeholder="abcd@gmail.com" className={`${style.input}`}></input>
                                    </div>
                                    <div className="flex-1">
                                        <button type="submit" disabled={loading} className={`${style.button} p-3`}>{content.confirm}</button>
                                    </div>
                                </div>
                            </form>
                            <form onSubmit={resetPass} className={visible ? "visible" : "invisible"}>
                                <div className="space-y-1 mt-6">
                                    <label className={`${style.label}`}>{content.otp}</label>
                                    <input type='text' name="otp" value={reset.otp} onChange={resetPassChange} placeholder="abcxyz" className={`${style.input}`}></input>
                                </div>
                                <div className="space-y-1 mt-2 relative">
                                    <label className={`${style.label}`}>{content.newpass}</label>
                                    <input type={showPass.passForget ? "text" : "password"} placeholder="123456xyz" name="newPassword" value={reset.newPassword} onChange={resetPassChange} className={`${style.input}`}></input>
                                    <button onClick={() => toggleShowPass('passForget')} className="rounded-md p-1 absolute left-[90%] top-[46%]" type="button">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12C4.8 8.2 8.1 6.5 12 6.5s7.2 1.7 9.5 5.5c-2.3 3.8-5.6 5.5-9.5 5.5S4.8 15.8 2.5 12z" /><circle cx="12" cy="12" r="2.4" /></svg>
                                    </button>
                                </div>
                                <div className="mt-6">
                                    <button type="submit" disabled={loading} className={`${style.button} mx-auto`}>{content.changepass}</button>
                                </div>
                            </form>
                            <button onClick={() => { setView('login'); setErr(null); setSucc(null); }} className="font-josefin text-gray-500 mx-auto mt-4 underline block hover:text-black transition-all duration-300 ease-in-out">{content.backlogin}</button>
                        </motion.div>
                    )}
                    {/* ----------------------------------------------------------------------------REGISTER-------------------------------------------------------------------------------- */}
                    {view === "register" && (
                        <motion.div key="register" {...slideAnimation} className="w-full relative">
                            <div className={`${style.heading}`}>{content.register}</div>
                            {err && (
                                <ErrorNoti err={err} />
                            )}
                            {succ && (
                                <SuccessNoti succ={succ} />
                            )}
                            <form onSubmit={handleRegister}>
                                <div className="space-y-1 mt-1">
                                    <label className={`${style.label}`}>{content.name}</label>
                                    <input type="text" name="name" value={register.name} onChange={registerChange} className={`${style.input}`}></input>
                                </div>
                                <div className="space-y-1 mt-1 relative">
                                    <label className={`${style.label}`}>{content.email}</label>
                                    <input type="email" name="email" value={register.email} onChange={registerChange} placeholder="abcd@gmail.com" className={`${style.input}`}></input>
                                    <div className="rounded-md p-1 absolute left-[90%] top-[46%] lg:hover:cursor-pointer" onMouseEnter={!mobile ? () => setWaring(true) : undefined} onMouseLeave={!mobile ? () => setWaring(false) : undefined} onClick={mobile ? () => setWaring(!waring) : undefined}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7V13" /><circle cx="12" cy="17" r="0.2" /></svg>
                                    </div>
                                    <div className={`${style.text} ${waring ? "block" : "hidden"} text-sm absolute text-yellow-700 z-50 pointer-events-none bg-yellow-200 p-2 rounded-md`}>{content.warning}</div>
                                </div>
                                <div className="space-y-1 mt-2 relative">
                                    <label className={`${style.label}`}>{content.enterpass}</label>
                                    <input type={showPass.passRegister ? "text" : "password"} name="password" value={register.password} onChange={registerChange} placeholder="123456xyz" className={`${style.input}`} />
                                    <button onClick={() => toggleShowPass('passRegister')} className="rounded-md p-1 absolute left-[90%] top-[46%]" type="button">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12C4.8 8.2 8.1 6.5 12 6.5s7.2 1.7 9.5 5.5c-2.3 3.8-5.6 5.5-9.5 5.5S4.8 15.8 2.5 12z" /><circle cx="12" cy="12" r="2.4" /></svg>
                                    </button>
                                </div>
                                <div className="space-y-1 mt-2 relative">
                                    <label className={`${style.label}`}>{content.confirmpass}</label>
                                    <input type={showPass.confPassRegister ? "text" : "password"} name="confirm" value={register.confirm} onChange={registerChange} placeholder="123456xyz" className={`${style.input}`} />
                                    <button onClick={() => toggleShowPass('confPassRegister')} className="rounded-md p-1 absolute left-[90%] top-[46%]" type="button">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12C4.8 8.2 8.1 6.5 12 6.5s7.2 1.7 9.5 5.5c-2.3 3.8-5.6 5.5-9.5 5.5S4.8 15.8 2.5 12z" /><circle cx="12" cy="12" r="2.4" /></svg>
                                    </button>
                                </div>
                                <button type="submit" disabled={loading} className={`${style.button} mx-auto mt-6`}>{content.register}</button>
                            </form>
                            <button onClick={() => { setView('login'); setErr(null); setSucc(null) }} className="font-josefin text-gray-500 mx-auto mt-4 underline block hover:text-black transition-all duration-300 ease-in-out">{content.backlogin}</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}