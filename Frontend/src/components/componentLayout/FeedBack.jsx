import AnimatedSection from "../comon/Animation/AnimatedSection";
import AnimatedTitle from "../comon/Animation/AnimatedTitle";
import AnimatedText from "../comon/Animation/AnimatedText";
import { useState } from "react";
import submissionApi from "../../api/submissionApi";

export default function Feedback({ style }) {
    const [form, setForm] = useState({name: "", email: "", desc: "", purpose: "", status: "feedback"});
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
        <AnimatedSection className='max-w-3xl lg:px-0 px-4 lg:mx-auto pb-10'>
            <AnimatedTitle className={`${style.heading} lg:text-4xl text-xl lg:pb-6 pb-4 text-center`}>
                Hãy cho chúng tôi biết suy nghĩ của bạn
            </AnimatedTitle>
            <AnimatedText>
                <form onSubmit={Create} className='border Shadow border-gray-400 p-4 lg:p-6'>
                    <div className='space-y-4'>
                        <input type="text" name="name" value={form.name} onChange={HandleOnchange} placeholder="Tên" className={`${style.input}`} />
                        <input type="email" name="email" value={form.email} onChange={HandleOnchange} placeholder="Email" className={`${style.input}`} />
                        <input type="text" name="purpose" value={form.purpose} onChange={HandleOnchange} placeholder="Mục đích liên hệ" className={`${style.input}`} />
                        <input type="text" name="desc" value={form.desc} onChange={HandleOnchange} placeholder="Nội dung" className={`${style.input}`} />
                    </div>
                    <button type='submit' disabled={loading} className={`font-josefin ${style.button} text-lg p-2 mt-8 lg:mt-16 underline lg:no-underline lg:hover:underline duration-300 ease-in-out`}>Gửi→</button>
                </form>
            </AnimatedText>
        </AnimatedSection>
    )
}