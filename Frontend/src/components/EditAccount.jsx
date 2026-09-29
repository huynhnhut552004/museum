import { useState, useEffect } from "react";
import userApi from "../api/userApi";
import ErrorNoti from "./comon/Noti/Error";
import SuccessNoti from "./comon/Noti/Success";
import { AnimatePresence, motion } from "framer-motion";
import AnimatedSection from "./comon/Animation/AnimatedSection";
import AnimatedText from "./comon/Animation/AnimatedText";
import AnimatedTitle from "./comon/Animation/AnimatedTitle";
import LostConnection from "./LostConnection";

const MotionDiv = motion.div;

export default function EditAccountLayout({ style, content, noti, lang }) {
    const [infor, setInfor] = useState({ name: "", userTag: "", email: "", emailSuffix: "", ban: false });
    const [succ, setSucc] = useState('');
    const [err, setErr] = useState('');
    const [showPass, setShowPass] = useState({ oldPass: false, newPass: false, confPass: false });
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [form, setForm] = useState({ name: "", Email: "", otp: "", oldPass: "", newPass: "", confPass: "" });
    const [view, setView] = useState('');
    const [errorloadInfo, setErrLoadInfo] = useState(false);

    const slideAnimation = {
        initial: { y: 600, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -600, opacity: 0 },
        transition: { duration: 0.3, ease: "easeInOut" }
    };

    const getInfor = async () => {
        try {
            const res = await userApi.get();
            const data = res.data.data;
            const emailParts = data.email?.split('@') || ["", ""];
            const prefix = emailParts[0];
            const suffix = emailParts.length > 1 ? `@${emailParts[1]}` : "";
            setInfor({
                name: data.full_name,
                userTag: data.user_tag,
                email: prefix,
                emailSuffix: suffix,
                ban: data.is_ban
            });
        } catch {
            setErrLoadInfo(true);
            setInfor({ name: "", email: "", emailSuffix: "", ban: false });
        }
    };

    useEffect(() => {
        getInfor();
    }, []);

    const toggleName = (e) => {
        e.preventDefault();
        setErr('');
        setSucc('');
        setForm({ name: infor.name });
        setView('updateName');
    };

    const toggleEmail = (e) => {
        e.preventDefault();
        setErr('');
        setSucc('');
        const fullEmail = `${infor.email}${infor.emailSuffix || ""}`;
        setForm(prevForm => ({
            ...prevForm,
            Email: fullEmail
        }));
        setView('updateEmail');
    };

    const togglePass = (e) => {
        e.preventDefault();
        setErr('');
        setSucc('');
        setView('updatePass');
    };

    const toggleShowPass = (field) => {
        setShowPass(prevState => ({
            ...prevState,
            [field]: !prevState[field]
        }));
    };

    const handleOnchange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    };

    const resetForm = () => {
        setForm({ name: "", Email: "", otp: "", oldPass: "", newPass: "", confPass: "" });
    };

    const changeName = async (e) => {
        e.preventDefault();
        if (form.name === infor.name) return;
        if (!form.name) {
            setErr(noti.wrongdata);
            return;
        }
        if (form.name.length > 20) {
            setErr(noti.tolong);
            return;
        }
        try {
            setLoading(true);
            setErr('');
            await userApi.update(form.name);
            await getInfor();
            setSucc(noti.successname);
            resetForm();
        } catch (error) {
            setSucc('');
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

    const sendOtp = async (e) => {
        e.preventDefault();
        if (!form.Email) {
            setErr(noti.wrongdata);
            return;
        }
        try {
            setLoading(true);
            setErr('');
            setSucc('');
            await userApi.changeEmail(form.Email);
            setVisible(true);
        } catch (error) {
            if (error.response) {
                setErr(error.response.status === 400 ? noti.wrongdata : noti.undef);
            } else if (error.request) {
                setErr(noti.server);
            } else {
                setErr(noti.undef);
            }
        } finally {
            setLoading(false)

        }
    };

    const changeEmail = async (e) => {
        e.preventDefault();
        if (!form.otp) {
            setErr(noti.wrongdata);
            return;
        }
        if (form.Email === `${infor.email}${infor.emailSuffix || ""}`) return;
        try {
            setLoading(true);
            setErr('');
            setSucc('');
            await userApi.verifyEmail(form.otp);
            setSucc(noti.successemail);
            await getInfor();
            resetForm();
        } catch {
            setSucc('');
            setErr(noti.unchangeemail);
        } finally {
            setLoading(false);
        }
    };

    const changPass = async (e) => {
        e.preventDefault();
        if (!form.oldPass || !form.newPass) {
            setErr(noti.wrongdata);
            return;
        }
        try {
            if (form.newPass != form.confPass) {
                setErr(noti.notmatch)
                return;
            }
            setLoading(true);
            setErr('');
            setSucc('');
            await userApi.changePassword(form.oldPass, form.newPass);
            setSucc(noti.successpass);
            await getInfor();
            resetForm();
        } catch (error) {
            setSucc('');
            if (error.response) {
                const { status } = error.response;
                if (status === 400) {
                    setErr(noti.weakpass);
                } else if (status === 500) {
                    setErr(noti.wrongpass);
                }
            } else if (error.request) {
                setErr(noti.server);
            } else {
                setErr(noti.undef);
            }
        } finally {
            setLoading(false);
        }
    }

    if (errorloadInfo) return (<LostConnection click={getInfor()} lang={lang} />);

    return (
        <div className="pb-10">
            <style>{`
                    input::-ms-reveal,
                    input::-ms-clear {
                        display: none;
                    }
                    input::placeholder {
                        color: #6b7280;
                    }
                `}</style>
            <div className="max-w-6xl flex lg:gap-4 gap-2 mx-auto ">
                <AnimatedSection className="w-[50%]">
                    <AnimatedTitle className={style.heading}>{content.heaing}</AnimatedTitle>
                    <AnimatedTitle className={`${!infor.email ? "block" : "hidden"} Style-Text1 lg:relative text-red-700 bg-red-300 p-2 rounded-md inline-block`}>{content.expired}</AnimatedTitle>
                    <div className={`p-2 border ${style.border} rounded-md space-y-2 mt-4 shadow-xl`}>
                        <AnimatedText onClick={toggleName} className={`lg:flex items-center gap-2 lg:cursor-pointer ${style.hover_div} p-2 rounded-md`}>
                            <span className={`${style.heading} text-base lg:text-2xl`}>{content.yourname1}</span><span className={`${style.text} lg:text-xl flex items-center justify-between flex-1 gap-2`}>{infor.name} #{infor.userTag} <svg width="20" height="20" viewBox="0 0 24 24" fill="none" role="img" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4L17 12L7 20" /></svg></span>
                        </AnimatedText>
                        <AnimatedText onClick={toggleEmail} className={`lg:flex items-center gap-2 lg:cursor-pointer ${style.hover_div} p-2 rounded-md`}>
                            <span className={`${style.heading} text-base lg:text-2xl`}>Email: </span><span className={`${style.text} lg:text-xl flex items-center justify-between flex-1 gap-2`}>{infor.email} <svg width="20" height="20" viewBox="0 0 24 24" fill="none" role="img" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4L17 12L7 20" /></svg></span>
                        </AnimatedText>
                        <AnimatedText className="">
                            <button type="button" onClick={togglePass} className={`flex ${style.heading} text-base lg:text-2xl justify-between text-left items-center w-full gap-2 ${style.hover_div} p-2 rounded-md`}>{content.changepass1}<svg width="20" height="20" viewBox="0 0 24 24" fill="none" role="img" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4L17 12L7 20" /></svg></button>
                        </AnimatedText>
                        <AnimatedText className={`${style.text} text-left p-2 ${infor.ban ? "text-red-600" : "text-green-600"}`}>
                            {infor.ban ? content.ban : content.unban}
                        </AnimatedText>
                    </div>
                </AnimatedSection>
                <section className="flex-1">
                    <AnimatePresence mode="wait">
                        {view === 'updateName' && (
                            <MotionDiv key="updateName" {...slideAnimation} className="">
                                <div className={style.heading}>{content.changename}</div>
                                <form onSubmit={changeName} className={`border ${style.border} shadow-xl space-y-4 p-2 rounded-md mt-4`}>
                                    <div className="">
                                        <div className={`${style.heading} text-base lg:text-2xl`}>{content.newname}</div>
                                        <input type="text" name="name" value={form.name} onChange={handleOnchange} placeholder={content.yourname2} className={style.input} />
                                    </div>
                                    <div className="text-right lg:flex justify-between items-center">
                                        <div className="flex-1 lg:block hidden">
                                            {err && (<ErrorNoti err={err} />)}
                                            {succ && (<SuccessNoti succ={succ} />)}
                                        </div>
                                        <div className="lg:w-36">
                                            <button type="submit" disabled={loading} className={`${style.heading} text-base lg:text-xl font-bold ${style.text_color} ${style.bg_button} p-2 rounded-md`}>{content.confirm}</button>
                                        </div>
                                    </div>
                                </form>
                            </MotionDiv>
                        )}
                        {view === 'updateEmail' && (
                            <MotionDiv key="updateEmail" {...slideAnimation} className="">
                                <div className={style.heading}>{content.changeemail}</div>
                                <form onSubmit={visible ? changeEmail : sendOtp} className={`border ${style.border} shadow-xl space-y-4 p-2 rounded-md mt-4`}>
                                    <div className="lg:flex items-end justify-between lg:space-y-0 space-y-2">
                                        <div className="flex-1">
                                            <div className={`${style.heading} text-base lg:text-2xl`}>{content.newemail}</div>
                                            <input type="email" name="Email" onChange={handleOnchange} value={form.Email} placeholder={content.youremail} className={style.input} />
                                        </div>
                                        <div className="lg:w-20 text-right">
                                            <button type="button" disabled={loading} onClick={sendOtp} className={`${style.heading} text-base lg:text-xl font-bold ${style.text_color} ${style.bg_button} p-2 rounded-md`}>{content.seen}</button>
                                        </div>
                                    </div>
                                    {visible && (
                                        <div className="space-y-2">
                                            <div className="flex items-end justify-between">
                                                <div className="flex-1">
                                                    <div className={`${style.heading} text-base lg:text-2xl`}>{content.otp}</div>
                                                    <input type="text" name="otp" onChange={handleOnchange} value={form.otp} placeholder={content.otp} className={style.input} />
                                                </div>
                                            </div>
                                            <div className="text-right lg:flex justify-between items-center">
                                                <div className="flex-1 lg:block hidden">
                                                    {err && (<ErrorNoti err={err} />)}
                                                    {succ && (<SuccessNoti succ={succ} />)}
                                                </div>
                                                <div className="lg:w-36 text-right">
                                                    <button type="submit" disabled={loading} className={`${style.heading} text-base lg:text-xl font-bold ${style.text_color} ${style.bg_button} p-2 rounded-md`}>{content.confirm}</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </form>
                            </MotionDiv>
                        )}
                        {view === 'updatePass' && (
                            <MotionDiv key="updatePass" {...slideAnimation} className="">
                                <div className={style.heading}>{content.changepass2}</div>
                                <form onSubmit={changPass} className={`border ${style.border} shadow-xl space-y-4 p-2 rounded-md mt-4`}>
                                    <div className="relative">
                                        <div className={`${style.heading} text-base lg:text-2xl`}>{content.oldpass1}</div>
                                        <input type={showPass.oldPass ? "text" : "password"} name="oldPass" value={form.oldPass} onChange={handleOnchange} placeholder={content.oldpass2} className={style.input} />
                                        <button onClick={() => toggleShowPass('oldPass')} className="rounded-md p-1 absolute lg:left-[92%] left-[80%] top-[55%]" type="button">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12C4.8 8.2 8.1 6.5 12 6.5s7.2 1.7 9.5 5.5c-2.3 3.8-5.6 5.5-9.5 5.5S4.8 15.8 2.5 12z" /><circle cx="12" cy="12" r="2.4" /></svg>
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <div className={`${style.heading} text-base lg:text-2xl`}>{content.newpass}</div>
                                        <input type={showPass.newPass ? "text" : "password"} name="newPass" value={form.newPass} onChange={handleOnchange} placeholder={content.newpass} className={style.input} />
                                        <button onClick={() => toggleShowPass('newPass')} className=" rounded-md p-1 absolute lg:left-[92%] left-[80%] top-[55%]" type="button">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12C4.8 8.2 8.1 6.5 12 6.5s7.2 1.7 9.5 5.5c-2.3 3.8-5.6 5.5-9.5 5.5S4.8 15.8 2.5 12z" /><circle cx="12" cy="12" r="2.4" /></svg>
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <div className={`${style.heading} text-base lg:text-2xl`}>{content.confirmpass1}</div>
                                        <input type={showPass.confPass ? "text" : "password"} name="confPass" value={form.confPass} onChange={handleOnchange} placeholder={content.confirmpass2} className={style.input} />
                                        <button onClick={() => toggleShowPass('confPass')} className=" rounded-md p-1 absolute lg:left-[92%] left-[80%] top-[55%]" type="button">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12C4.8 8.2 8.1 6.5 12 6.5s7.2 1.7 9.5 5.5c-2.3 3.8-5.6 5.5-9.5 5.5S4.8 15.8 2.5 12z" /><circle cx="12" cy="12" r="2.4" /></svg>
                                        </button>
                                    </div>
                                    <div className="text-right lg:flex justify-between items-center">
                                        <div className="flex-1 lg:block hidden">
                                            {err && (<ErrorNoti err={err} />)}
                                            {succ && (<SuccessNoti succ={succ} />)}
                                        </div>
                                        <div className="lg:w-36 ">
                                            <button type="submit" disabled={loading} className={`${style.heading} text-base lg:text-xl font-bold ${style.text_color} ${style.bg_button} p-2 rounded-md`}>{content.confirm}</button>
                                        </div>
                                    </div>
                                </form>
                            </MotionDiv>
                        )}
                    </AnimatePresence>
                </section>
            </div>
            <AnimatedSection>
                <AnimatedTitle className={`${!infor.email ? "block" : "hidden"} lg:hidden Style-Text1 absolute top-[52%] left-0 lg:relative text-red-700 bg-red-300 p-2 rounded-md inline-block`}>{content.expired}</AnimatedTitle>
                <AnimatedTitle className="lg:hidden block">
                    {err && (<ErrorNoti err={err} />)}
                    {succ && (<SuccessNoti succ={succ} />)}
                </AnimatedTitle>
            </AnimatedSection>
        </div>
    );
}