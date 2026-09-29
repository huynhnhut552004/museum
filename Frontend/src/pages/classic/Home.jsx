import React, { useState, useEffect } from 'react';
import contentApi from '../../api/contentApi';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Hero from '../../components/classic/home/Hero';
import Intro from '../../components/classic/home/Intro';
import Interaction from '../../components/classic/home/Interaction';
import Nation from '../../components/classic/home/Nation';
import Spiritual from '../../components/classic/home/Spiritual';
import Scroll from '../../components/classic/home/Scroll';
import Produce from '../../components/classic/home/Produce';
import PageTransition from "../../components/comon/Animation/AnimatedPage";
import LostConnection from '../../components/LostConnection';
import { useLanguage } from "../../routes/LanguageContext";

const LayoutRegistry = {
    'hero_block': Hero,
    'intro_block': Intro,
    'scroll_block': Scroll,
    'spiritual_block': Spiritual,
    'nation_block': Nation,
    'produce_block': Produce,
    'interaction_block': Interaction,
};

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
    const [blocks, setBlocks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { lang } = useLanguage();
    const [err, setErr] = useState(null);

    const fetchData = () => {
        setIsLoading(true);
        setErr(null);
        contentApi.get('home')
            .then(res => setBlocks(res.data.data || []))
            .catch(() => setErr('Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.'))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!isLoading && blocks.length > 0) {
            const handleRefresh = () => {
                ScrollTrigger.refresh();
            };
            const images = document.querySelectorAll('img');
            let imagesLoaded = 0;
            if (images.length === 0) {
                handleRefresh();
            } else {
                images.forEach(img => {
                    if (img.complete) {
                        imagesLoaded++;
                        if (imagesLoaded === images.length) handleRefresh();
                    } else {
                        img.addEventListener('load', () => {
                            imagesLoaded++;
                            handleRefresh();
                        });
                        img.addEventListener('error', () => {
                            imagesLoaded++;
                            handleRefresh();
                        });
                    }
                });
            }
            const fallbackTimer = setTimeout(() => {
                handleRefresh();
            }, 1000);
            return () => {
                clearTimeout(fallbackTimer);
                images.forEach(img => {
                    img.removeEventListener('load', handleRefresh);
                    img.removeEventListener('error', handleRefresh);
                });
            };
        }
    }, [isLoading, blocks]);

    useEffect(() => {
        if (!isLoading) {
            setTimeout(() => {
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }, 0);
        }
    }, [isLoading]);

    const formatPropsForBlock = (blockType, content) => {
        const langData = content[lang] || {};
        switch (blockType) {
            case 'hero_block':
            case 'intro_block':
            case 'spiritual_block':
            case 'produce_block':
                return {
                    title: langData.title,
                    desc: langData.desc,
                    nav: langData.nav,
                    img: content.media_url,
                    video: content.media_url
                };

            case 'scroll_block':
                return {
                    img: content.media_url,
                    desc1: { title: langData.desc1_title, desc: langData.desc1_desc },
                    desc2: { title: langData.desc2_title, desc: langData.desc2_desc },
                    desc3: { title: langData.desc3_title, desc: langData.desc3_desc },
                    desc4: { title: langData.desc4_title, desc: langData.desc4_desc }
                };

            case 'nation_block':
                return {
                    defaultImg: content.defaultImg,
                    items: (content.items || []).map(item => ({
                        title: lang === 'vi' ? item.viTitle : item.enTitle,
                        img: item.imgUrl
                    }))
                };

            case 'interaction_block':
                return {
                    Data: (content.items || []).map((item, idx) => ({
                        id: item.id || idx,
                        image: item.imgUrl,
                        ratio: item.ratio,
                        title: lang === 'vi' ? item.viTitle : item.enTitle,
                        desc: lang === 'vi' ? item.viDesc : item.enDesc,
                        by: lang === 'vi' ? item.viBy : item.enBy,
                    }))
                };

            default:
                return content;
        }
    };

    if (isLoading) return (<div className="h-screen -mt-4 Style-Heading2 flex items-center justify-center">{lang === "vi" ? "Đang tải..." : "Loading..."}</div>);

    if (err) return (<LostConnection click={fetchData} lang={lang} />)

    return (
        <PageTransition>
            {blocks.map(block => {
                const Layout = LayoutRegistry[block.block_type];
                if (!Layout) return null;
                const formattedProps = formatPropsForBlock(block.block_type, block.content);
                return <Layout key={block.id} {...formattedProps} />;
            })}
        </PageTransition>
    )
}