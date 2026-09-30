import userApi from "../api/userApi";
import { useState, useEffect, useRef } from "react";
import ErrorNoti from "./comon/Noti/Error";
import SuccessNoti from "./comon/Noti/Success";
import AnimatedSection from "./comon/Animation/AnimatedSection";
import AnimatedTitle from "./comon/Animation/AnimatedTitle";
import AnimatedText from "./comon/Animation/AnimatedText";
import LostConnection from "./LostConnection";

const toForm = (data) => {
    const info = data?.info ?? data ?? {};
    return {
        email: data?.email ?? info.email ?? "",
        nickName: info.nickName ?? "",
        birthday: info.birthday ?? "",
        hobby: info.hobby ?? "",
        description: info.description ?? ""
    };
};

export default function EditInfoLayout({ lang, style, content, noti }) {
    const initialForm = useRef(null);
    const [succ, setSucc] = useState(null);
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadUI, setLoadUI] = useState(false);
    const [form, setForm] = useState({ email: "", nickName: "", birthday: "", hobby: "", description: "" });
    const [errorloadInfo, setErrLoadInfo] = useState(false);

    const getInfo = async () => {
        try {
            setLoadUI(true);
            setErrLoadInfo(false);
            const res = await userApi.get();
            const userInfo = toForm(res?.data?.data?.info);
            setForm(userInfo);
            initialForm.current = userInfo;
        } catch {
            setErrLoadInfo(true);
        } finally {
            setLoadUI(false);
        }
    };

    useEffect(() => {
        getInfo();
    }, []);

    const handleOnchange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    };

    const update = async () => {
        if (!initialForm.current || Object.keys(form).every((key) => form[key] === initialForm.current[key])) return;
        try {
            setLoading(true);
            setErr(null);
            setSucc(null);
            const res = await userApi.updateInfo(form);
            const savedForm = toForm(res?.data?.data);
            setForm(savedForm);
            initialForm.current = savedForm;
            setSucc(noti.succes);
        } catch {
            setSucc(null);
            setErr(noti.err);
        } finally {
            setTimeout(() => {
                setErr(null);
                setSucc(null);
            }, 2000);
            setLoading(false);
        }
    };

    if (errorloadInfo) return (<LostConnection lang={lang} click={getInfo} />);

    if (loadUI) return <div className={`h-screen -mt-4 ${style.heading} flex items-center justify-center`}>{lang === "vi" ? "Đang tải..." : "Loading..."}</div>;

    return (
        <AnimatedSection className="max-w-6xl px-4 lg:px-0 flex flex-col lg:gap-4 gap-2 mx-auto pb-10">
            <div className="flex justify-between">
                <AnimatedTitle className={`flex-1 ${style.heading}`}>
                    {content.title}
                </AnimatedTitle>
                <AnimatedText className=" w-[30%] text-right lg:block hidden">
                    <button type="button" disabled={loading} onClick={update} className={`${style.heading} text-base lg:text-xl font-bold ${style.text_color} ${style.bg_button} p-2 rounded-md`}>{content.button}</button>
                    {err && (<ErrorNoti err={err} />)}
                    {succ && (<SuccessNoti succ={succ} />)}
                </AnimatedText>
            </div>
            <div className={`border ${style.border} rounded-lg p-4`}>
                <div className={`grid lg:grid-cols-2 lg:gap-x-4 gap-2 border-b ${style.borderSection} p-4`}>
                    <AnimatedTitle className="lg:order-1 order-1"><label className={`${style.heading} lg:text-2xl text-xl `}>{content.nickName}</label></AnimatedTitle>
                    <AnimatedTitle className="lg:order-2 order-3"><label className={`${style.heading} lg:text-2xl text-xl `}>{content.birthday}</label></AnimatedTitle>
                    <AnimatedText className="lg:order-3 order-2"><input spellCheck={false} type='text' name="nickName" placeholder={content.inputNickName} value={form.nickName} onChange={handleOnchange} className={style.input} /></AnimatedText>
                    <AnimatedText className="lg:order-4 order-4"><input spellCheck={false} type='text' name="birthday" placeholder={content.inputBirthday} value={form.birthday} onChange={handleOnchange} className={style.input} /></AnimatedText>
                </div>
                <div className={`grid lg:grid-cols-2 lg:gap-x-4 gap-2 2 border-b ${style.borderSection} p-4`}>
                    <AnimatedTitle className="lg:order-1 order-1"><label className={`${style.heading} lg:text-2xl text-xl `}>Email</label></AnimatedTitle>
                    <AnimatedTitle className="lg:order-2 order-3"><label className={`${style.heading} lg:text-2xl text-xl `}>{content.hobby}</label></AnimatedTitle>
                    <AnimatedText className="lg:order-3 order-2"><input spellCheck={false} type='text' name="email" placeholder={content.inputEmail} value={form.email} onChange={handleOnchange} className={style.input} /></AnimatedText>
                    <AnimatedText className="lg:order-4 order-4"><input spellCheck={false} type='text' name="hobby" placeholder={content.inputHobby} value={form.hobby} onChange={handleOnchange} className={style.input} /></AnimatedText>
                </div>
                <div className="flex flex-col gap-2 p-4">
                    <AnimatedTitle><label className={`lg:text-2xl text-xl ${style.heading}`}>{content.desc}</label></AnimatedTitle>
                    <AnimatedText><textarea spellCheck={false} type='text' name="description" placeholder={content.inputdesc} value={form.description} onChange={handleOnchange} className={`${style.input} h-[20vh] resize-none`} /></AnimatedText>
                </div>
            </div>
            <AnimatedText className=" text-right lg:hidden block pt-2">
                <button type="button" disabled={loading} onClick={update} className={`${style.heading} text-base lg:text-xl font-bold ${style.text_color} ${style.bg_button} p-2 rounded-md`}>{content.button}</button>
                {err && (<ErrorNoti err={err} />)}
                {succ && (<SuccessNoti succ={succ} />)}
            </AnimatedText>
        </AnimatedSection>
    )
}