import AnimatedSection from "../comon/Animation/AnimatedSection";
import AnimatedText from "../comon/Animation/AnimatedText";
import AnimatedTitle from "../comon/Animation/AnimatedTitle";
import { useState } from "react";
import submissionApi from "../../api/submissionApi";

export default function Contact({ thanks, title1, title2, hot, fdback, style }) {
    const [form, setForm] = useState({name: "", email: "", desc: "", purpose: "", status: "contact"});
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    const HandleOnchange = (e) => {
        setForm({
            ...form,
                [e.target.name]: e.target.value
            })
            if(err) setErr(''); 
    };

    const Create = async(e) => {
        e.preventDefault();
        setErr('');
        setLoading(true);
        try {
            const formData = {
            name: form.name,
            email: form.email,
            desc: form.desc,
            purpose: form.purpose,
            status: form.status
        };
            await submissionApi.create(formData);
            setForm({name: "", email: "", desc: "", purpose: "", status: "rule"});
        } catch (error) {
            if(error.response){
                if(error.response.status === 400){
                    setErr('Vui lòng kiếm tra lại dữ liệu!');
                }
            }else if(error.request){
                setErr('Đã có lỗi xảy ra, vui lòng thử lại sau!');
            }else{
                setErr('Không thể kết nối server!');
            }
        } finally{
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen">
            <AnimatedSection className="max-w-6xl lg:mx-auto lg:pb-10 pb-6 px-4">
                <AnimatedTitle className={`${style.heading} lg:text-6xl text-3xl text-center lg:pb-6 pb-4`}>{thanks}</AnimatedTitle>
                <AnimatedTitle className={`${style.heading} lg:pb-4 pb-2`}>{title1}</AnimatedTitle>
                <div className="space-y-2">
                    {hot.map((item, index) => (
                        <AnimatedText key={index}>
                            <div className={`${style.text}`}>{item}</div>
                        </AnimatedText>
                    ))}
                </div>
            </AnimatedSection>
            <div className="border-t lg:pt-10 pt-6 border-gray-400 px-4 lg:px-0 mb-10">
                <AnimatedSection className="max-w-6xl mx-auto">
                    <AnimatedTitle className={`${style.heading}`}>{title2}</AnimatedTitle>
                    <AnimatedText>
                        <form onSubmit={Create}  className="border border-gray-400 lg:p-6 p-4 Shadow lg:mt-10 mt-6" >
                            <div className="space-y-2">
                                <input type="text" name="name" value={form.name} onChange={HandleOnchange} placeholder="Tên" className={`${style.input}`} />
                                <input type="email" name="email" value={form.email} onChange={HandleOnchange} placeholder="Email" className={`${style.input}`} />
                                <input type="text" name="purpose" value={form.purpose} onChange={HandleOnchange} placeholder="Mục đích liên hệ" className={`${style.input}`} />
                                <input type="text" name="desc" value={form.desc} onChange={HandleOnchange} placeholder="Nội dung" className={`${style.input}`} />
                            </div>
                            <button type="submit" disabled={loading} className={`font-josefin ${style.button} text-xl lg:text-lg p-2 lg:mt-16 mt-8 underline lg:no-underline lg:hover:underline duration-300 ease-in-out`}>Gửi→</button>
                        </form>
                    </AnimatedText>
                    <AnimatedText className="Style-Text1 lg:pt-6 pt-4">{fdback}</AnimatedText>
                </AnimatedSection>
            </div>
        </div>
    )
}