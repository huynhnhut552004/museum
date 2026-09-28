import PageTransition from "../../components/comon/Animation/AnimatedPage";
import RuleLayout from "../../components/Rule";
import { useState, useEffect } from 'react';
import contentApi from '../../api/contentApi';
import { useLanguage } from "../../routes/LanguageContext";
import LostConnection from "../../components/LostConnection";

export default function Rule() {
    const [block, setBlock] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { lang } = useLanguage();
    const [err, setErr] = useState(null);

    const fetchData = () => {
        setIsLoading(true);
        setErr(null);
        contentApi.get('policy')
            .then(res => { const blocksArrays = res.data.data; setBlock(blocksArrays.length > 0 ? blocksArrays[0] : null) })
            .catch(error => setErr('Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.'))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const style = {
        heading: "Digital-Heading",
        text: "Digital-Text2",
        input: "Digital-Input",
        button: "text-[#F5F5F3]"
    };

    const contact = {
        title: lang === "vi" ? "Liên hệ" : "Contact",
        name: lang === "vi" ? "Tên" : "Name",
        purpose: lang === "vi" ? "Mục đích liên hệ" : "Purpose of contact",
        content: lang === "vi" ? "Nội dung" : "Contact information",
        button: lang === "vi" ? "Gửi" : "Seen"
    };

    const noti = {
        wrongdata: lang === "vi" ? 'Vui lòng kiểm tra lại dữ liệu!' : 'Please check the data again!',
        server: lang === "vi" ? 'Không thể kết nối đến Server!' : 'Cannot connect to the Server!',
        undef: lang === "vi" ? 'Đã có lỗi xảy ra!' : 'An error has occurred!'
    }

    if (isLoading) return (<div className="h-screen Digital-Heading flex items-center justify-center">{lang === "vi" ? "Đang tải..." : "Loading..."}</div>);

    if (err) return (<LostConnection click={fetchData} lang={lang} />);

    const content = block?.content || {};
    const items = content[lang] || content.vi || [];

    return (
        <PageTransition>
            <RuleLayout
                style={style}
                items={items}
                contact={contact}
                noti={noti}
            />
        </PageTransition>
    )
}