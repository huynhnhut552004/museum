import AnimatedSection from "../comon/Animation/AnimatedSection";
import AnimatedTitle from "../comon/Animation/AnimatedTitle";
import AnimatedText from "../comon/Animation/AnimatedText";
import { useState } from "react";
import submissionApi from "../../api/submissionApi";

export default function Rule({ items, style }) {
    const [form, setForm] = useState({name: "", email: "", desc: "", purpose: "", status: "rule"});
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
        <div>
            <div className="max-w-3xl lg:mx-auto lg:space-y-6 space-y-4 pb-10 lg:px-0 px-4">
                {items.map(item => (
                    <AnimatedSection key={item.id}>
                            <AnimatedTitle className={`${style.heading} lg:text-5xl text-3xl lg:pb-6 pb-4`}>{item.title}</AnimatedTitle>
                            {item.para.map((text, index) => (
                                <AnimatedText key={index} className={`${style.text}`}>{text}</AnimatedText>
                            ))}
                    </AnimatedSection>
                ))}
            </div>
            <AnimatedSection>
                    <div className="lg:pt-10 pt-6 border-t border-gray-400 mb-10" >
                        <div className="max-w-3xl lg:px-0 px-4 lg:mx-auto" >
                            <AnimatedTitle className={`${style.heading}`} >
                                Email liên hệ
                            </AnimatedTitle>
                            <AnimatedText>
                                <form onSubmit={Create} className="border border-gray-400 lg:p-6 p-4 Shadow lg:mt-10 mt-6" >
                                    <div className="space-y-2">
                                        <input type="text" name="name" value={form.name} onChange={HandleOnchange} placeholder="Tên" className={`${style.input}`} />
                                        <input type="email" name="email" value={form.email} onChange={HandleOnchange} placeholder="Email" className={`${style.input}`} />
                                        <input type="text" name="purpose" value={form.purpose} onChange={HandleOnchange} placeholder="Mục đích liên hệ" className={`${style.input}`} />
                                        <input type="text" name="desc" value={form.desc} onChange={HandleOnchange} placeholder="Nội dung" className={`${style.input}`} />
                                    </div>
                                    <button type="submit" disabled={loading} className={`font-josefin ${style.button} text-xl lg:text-lg p-2 lg:mt-16 mt-8 underline lg:no-underline lg:hover:underline duration-300 ease-in-out`}>Gửi→</button>
                                </form>
                            </AnimatedText>
                        </div>
                    </div>
            </AnimatedSection>
        </div>
    )
}