import { useState, useEffect } from "react";
import userApi from "../../api/userApi";
import ErrorNoti from "../comon/Noti/Error";
import SuccessNoti from "../comon/Noti/Success";
import { AnimatePresence, motion } from "framer-motion";
import AnimatedSection from "../comon/Animation/AnimatedSection";
import AnimatedText from "../comon/Animation/AnimatedText";
import AnimatedTitle from "../comon/Animation/AnimatedTitle";

export default function EditAccount({ style }) {
    const [infor, setInfor] = useState({ name: "", email: "", emailSuffix: "", ban: false });
    const [succ, setSucc] = useState('');
    const [err, setErr] = useState('');
    const [showPass, setShowPass] = useState({ oldPass: false, newPass: false, confPass: false });
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [form, setForm] = useState({ name: "", Email: "", otp: "", oldPass: "", newPass: "", confPass: "" });
    const [view, setView] = useState('');

    const slideAnimation = {
        initial: { y: 600, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -600, opacity: 0 },
        transition: {
            duration: 0.3,
            ease: "easeInOut"
        }
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
                email: prefix,
                emailSuffix: suffix,
                ban: data.is_ban
            });
        } catch (error) {
            console.log('Lỗi khi lấy thông tin!', error.response?.data || error.message);
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
    }

    const changeName = async (e) => {
        e.preventDefault();
        if (form.name === infor.name) return;
        if (!form.name) {
            setErr('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        try {
            setLoading(true);
            setErr('');
            await userApi.update(form.name);
            await getInfor();
            setSucc('Đổi tên thành công.');
            resetForm();
        } catch (error) {
            setSucc('');
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

    const sendOtp = async (e) => {
        e.preventDefault();
        if (!form.Email) {
            setErr('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        try {
            setLoading(true);
            setVisible(true);
            setErr('');
            setSucc('');
            await userApi.changeEmail(form.email);
        } catch (error) {
        } finally {
            setLoading(false)

        }
    };

    const changeEmail = async (e) => {
        e.preventDefault();
        if (!form.otp) {
            setErr('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        try {
            if (form.Email === infor.email) return;
            setLoading(true);
            setErr('');
            setSucc('');
            await userApi.verifyEmail(form.otp);
            setSucc('Đổi Email thành công.');
            await getInfor();
            resetForm();
        } catch (error) {
            setSucc('');
            setErr('Đổi email thất bại, vui lòng kiểm tra lại otp!');
        } finally {
            setLoading(false);
        }
    };

    const changPass = async (e) => {
        e.preventDefault();
        if (!form.oldPass || !form.newPass) {
            setErr('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        try {
            if (form.newPass != form.confPass) {
                setErr('Mật khẩu không khớp!')
                return;
            }
            setLoading(true);
            setErr('');
            setSucc('');
            await userApi.changeEmail(form.oldPass, form.newPass);
            setSucc('Đổi mật khẩu thành công.');
            await getInfor();
            resetForm();
        } catch (error) {
            setSucc('');
            if (error.response) {
                const { status } = error.response;
                if (status === 400) {
                    setErr('Mật khẩu yếu!');
                } else if (status === 500) {
                    setErr('Mật khẩu không đúng!');
                }
            } else if (error.request) {
                setErr("Không thể kết nối đến Server. Vui lòng kiểm tra mạng!");
            } else {
                setErr("Đã có lỗi xảy ra.");
            }
        } finally {
            setLoading(false);
        }
    }

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
                    <AnimatedTitle className={style.heading}>Thông tin cá nhân</AnimatedTitle>
                    <AnimatedTitle className={`${!infor.email ? "block" : "hidden"} Style-Text1 lg:relative text-red-700 bg-red-300 p-2 rounded-md inline-block`}>Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!</AnimatedTitle>
                    <div className={`p-2 border ${style.border} rounded-md space-y-2 mt-4 shadow-xl`}>
                        <AnimatedText onClick={toggleName} className={`lg:flex items-center gap-2 lg:cursor-pointer ${style.hover_div} p-2 rounded-md`}>
                            <span className={`${style.heading} text-base lg:text-2xl`}>Tên của bạn:</span><span className={`${style.text} lg:text-xl flex items-center justify-between flex-1 gap-2`}>{infor.name} <svg width="20" height="20" viewBox="0 0 24 24" fill="none" role="img" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4L17 12L7 20" /></svg></span>
                        </AnimatedText>
                        <AnimatedText onClick={toggleEmail} className={`lg:flex items-center gap-2 lg:cursor-pointer ${style.hover_div} p-2 rounded-md`}>
                            <span className={`${style.heading} text-base lg:text-2xl`}>Email: </span><span className={`${style.text} lg:text-xl flex items-center justify-between flex-1 gap-2`}>{infor.email} <svg width="20" height="20" viewBox="0 0 24 24" fill="none" role="img" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4L17 12L7 20" /></svg></span>
                        </AnimatedText>
                        <AnimatedText className="">
                            <button type="button" onClick={togglePass} className={`flex ${style.heading} text-base lg:text-2xl justify-between text-left items-center w-full gap-2 ${style.hover_div} p-2 rounded-md`}>Thay đổi mật khẩu <svg width="20" height="20" viewBox="0 0 24 24" fill="none" role="img" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4L17 12L7 20" /></svg></button>
                        </AnimatedText>
                        <AnimatedText className={`${style.text} text-left p-2 ${infor.ban ? "text-red-600" : "text-green-600"}`}>
                            {infor.ban ? "Tài khoản bị vô hiệu hoá, vui lòng liên hệ quản trị." : "Tài khoản còn hoạt động."}
                        </AnimatedText>
                    </div>
                </AnimatedSection>
                <section className="flex-1">
                    <AnimatePresence mode="wait">
                        {view === 'updateName' && (
                            <motion.div key="updateName" {...slideAnimation} className="">
                                <div className={style.heading}>Đổi tên</div>
                                <div className={`border ${style.border} shadow-xl space-y-4 p-2 rounded-md mt-4`}>
                                    <div className="">
                                        <div className={`${style.heading} text-base lg:text-2xl`}>Tên mới</div>
                                        <input type="text" name="name" value={form.name} onChange={handleOnchange} placeholder="Tên của bạn" className={style.input} />
                                    </div>
                                    <div className="text-right lg:flex justify-between items-center">
                                        <div className="flex-1 lg:block hidden">
                                            {err && (<ErrorNoti err={err} />)}
                                            {succ && (<SuccessNoti succ={succ} />)}
                                        </div>
                                        <div className="lg:w-36">
                                            <button type="button" disabled={loading} onClick={changeName} className={`${style.heading} text-base lg:text-xl font-bold ${style.text_color} ${style.bg_button} p-2 rounded-md`}>Xác nhận</button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {view === 'updateEmail' && (
                            <motion.div key="updateEmail" {...slideAnimation} className="">
                                <div className={style.heading}>Đổi Email</div>
                                <div className={`border ${style.border} shadow-xl space-y-4 p-2 rounded-md mt-4`}>
                                    <div className="lg:flex items-end justify-between lg:space-y-0 space-y-2">
                                        <div className="flex-1">
                                            <div className={`${style.heading} text-base lg:text-2xl`}>Email mới</div>
                                            <input type="email" name="Email" onChange={handleOnchange} value={form.Email} placeholder="Email của bạn" className={style.input} />
                                        </div>
                                        <div className="lg:w-20 text-right">
                                            <button type="button" disabled={loading} onClick={sendOtp} className={`${style.heading} text-base lg:text-xl font-bold ${style.text_color} ${style.bg_button} p-2 rounded-md`}>Gửi</button>
                                        </div>
                                    </div>
                                    {visible && (
                                        <div className="space-y-2">
                                            <div className="flex items-end justify-between">
                                                <div className="flex-1">
                                                    <div className={`${style.heading} text-base lg:text-2xl`}>Mã OTP</div>
                                                    <input type="text" name="otp" onChange={handleOnchange} value={form.otp} placeholder="Mã otp" className={style.input} />
                                                </div>
                                            </div>
                                            <div className="text-right lg:flex justify-between items-center">
                                                <div className="flex-1 lg:block hidden">
                                                    {err && (<ErrorNoti err={err} />)}
                                                    {succ && (<SuccessNoti succ={succ} />)}
                                                </div>
                                                <div className="lg:w-36 text-right">
                                                    <button type="button" disabled={loading} onClick={changeEmail} className={`${style.heading} text-base lg:text-xl font-bold ${style.text_color} ${style.bg_button} p-2 rounded-md`}>Xác nhận</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                        {view === 'updatePass' && (
                            <motion.div key="updatePass" {...slideAnimation} className="">
                                <div className={style.heading}>Đổi mật khẩu</div>
                                <div className={`border ${style.border} shadow-xl space-y-4 p-2 rounded-md mt-4`}>
                                    <div className="relative">
                                        <div className={`${style.heading} text-base lg:text-2xl`}>Mật khẩu cũ</div>
                                        <input type={showPass.oldPass ? "text" : "password"} name="oldPass" value={form.oldPass} onChange={handleOnchange} placeholder="Mật khẩu hiện tại" className={style.input} />
                                        <button onClick={() => toggleShowPass('oldPass')} className="rounded-md p-1 absolute lg:left-[92%] left-[80%] top-[55%]" type="button">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12C4.8 8.2 8.1 6.5 12 6.5s7.2 1.7 9.5 5.5c-2.3 3.8-5.6 5.5-9.5 5.5S4.8 15.8 2.5 12z" /><circle cx="12" cy="12" r="2.4" /></svg>
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <div className={`${style.heading} text-base lg:text-2xl`}>Mật khẩu mới</div>
                                        <input type={showPass.newPass ? "text" : "password"} name="newPass" value={form.newPass} onChange={handleOnchange} placeholder="Mật khẩu mới" className={style.input} />
                                        <button onClick={() => toggleShowPass('newPass')} className=" rounded-md p-1 absolute lg:left-[92%] left-[80%] top-[55%]" type="button">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12C4.8 8.2 8.1 6.5 12 6.5s7.2 1.7 9.5 5.5c-2.3 3.8-5.6 5.5-9.5 5.5S4.8 15.8 2.5 12z" /><circle cx="12" cy="12" r="2.4" /></svg>
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <div className={`${style.heading} text-base lg:text-2xl`}>Xác nhận mật khẩu</div>
                                        <input type={showPass.confPass ? "text" : "password"} name="confPass" value={form.confPass} onChange={handleOnchange} placeholder="Xác nhận lại mật khẩu" className={style.input} />
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
                                            <button type="button" disabled={loading} onClick={changPass} className={`${style.heading} text-base lg:text-xl font-bold ${style.text_color} ${style.bg_button} p-2 rounded-md`}>Xác nhận</button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </div>
            <AnimatedSection>
                <AnimatedTitle className={`${!infor.email ? "block" : "hidden"} lg:hidden Style-Text1 absolute top-[52%] left-0 lg:relative text-red-700 bg-red-300 p-2 rounded-md inline-block`}>Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!</AnimatedTitle>
                <AnimatedTitle className="lg:hidden block">
                    {err && (<ErrorNoti err={err} />)}
                    {succ && (<SuccessNoti succ={succ} />)}
                </AnimatedTitle>
            </AnimatedSection>
        </div>
    );
}