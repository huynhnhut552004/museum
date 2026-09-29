import PageTransition from "../../components/comon/Animation/AnimatedPage";
import Theme from "../../components/classic/explore/Theme";
import Hero from "../../components/classic/explore/Hero";
import Story from "../../components/classic/explore/Story";
import Tradition from "../../components/classic/explore/Tradition";
import Grid from "../../components/classic/explore/Grid";
import Video from "../../components/classic/explore/Video";
import Color from "../../components/classic/explore/Color";
import ZoomPoint from "../../components/classic/explore/ZoomPoint";
import Slide from "../../components/classic/explore/Slide";
import More from "../../components/classic/explore/More";
import { useState, useEffect } from 'react';
import contentApi from '../../api/contentApi';
import LostConnection from "../../components/LostConnection";
import { useLanguage } from "../../routes/LanguageContext";

const LayoutRegistry = {
    'exploreHero_block': Hero,
    'exploreTheme_block': Theme,
    'exploreStory_block': Story,
    'exploreTradition_block': Tradition,
    'exploreGrid_block': Grid,
    'explorevideo_block': Video,
    'exploreColor_block': Color,
    'exploreZoomImage_block': ZoomPoint,
    'exploreSlide_block': Slide,
    'exploreMore_block': More
}

export default function Explore() {
    const [blocks, setBlocks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { lang } = useLanguage();
    const [err, setErr] = useState(null);

    const resolveBlockLink = (targetType, targetData) => {
        if (!targetType || !targetData) return '#';
        switch (targetType) {
            case 'single':
                return `/artwork/${targetData.slug}`;
            case 'list':
                return `/explore/${targetData.facet_key}/${targetData.facet_value}`;
            case 'group':
                return `/explore/${targetData.facet_key}`;
            default:
                return '#';
        }
    };

    const fetchData = () => {
        contentApi.get('explore')
            .then(res => {
                setErr(null);
                setBlocks(res.data.data || []);
            })
            .catch(() => setErr('Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.'))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatPropsForBlock = (blockType, content) => {
        const langData = content[lang] || {};
        switch (blockType) {
            case 'exploreHero_block':
                return {
                    title1: langData.title1,
                    title2: langData.title2,
                    imgL: content.imgUrl1,
                    imgR: content.imgUrl2,
                    linkL: resolveBlockLink(content.targetLink1?.target_type, content.targetLink1?.target_data),
                    linkStateL: { titleVi: "vi".title1, titleEn: "en".title1 },
                    linkR: resolveBlockLink(content.targetLink2?.target_type, content.targetLink2?.target_data),
                    linkStateR: { titleVi: "vi".title2, titleEn: "en".title2 },
                }
            case 'exploreTheme_block':
            case 'exploreTradition_block': {
                const newItems = content.items.map((item) => ({
                    img: item.imgUrl,
                    title: lang === 'vi' ? item.viTitle : item.enTitle,
                    link: resolveBlockLink(item.targetLink?.target_type, item.targetLink?.target_data),
                    linkState: { titleVi: item.viTitle, titleEn: item.enTitle },
                    heading: lang === 'vi' ? 'Khám phá thêm' : 'Explore more',
                    end: lang === 'vi' ? 'Khám phá' : 'Explore'
                }));
                return {
                    hero: lang === 'vi' ? content.heading.viHeading : content.heading.enHeading,
                    items: newItems
                }
            }
            case 'exploreStory_block':
            case 'exploreMore_block':
                return {
                    link: resolveBlockLink(content.targetLink?.target_type, content.targetLink?.target_data),
                    title: langData.title,
                    desc: langData.desc,
                    img: content.media_url,
                    nav: langData.nav
                }
            case 'exploreGrid_block': {
                const itemst = {
                    link: resolveBlockLink(content.itemst.targetLink?.target_type, content.itemst.targetLink?.target_data),
                    img: content.itemst.imgUrl,
                    title: lang === 'vi' ? content.itemst.viTitle : content.itemst.enTitle
                };
                const items = content.items.map((item) => ({
                    link: resolveBlockLink(item.targetLink?.target_type, item.targetLink?.target_data),
                    img: item.imgUrl,
                    title: lang === 'vi' ? item.viTitle : item.enTitle
                }));
                return {
                    title: lang === 'vi' ? content.heading.viHeading : content.heading.enHeading,
                    itemst: itemst,
                    items: items
                }
            }
            case 'explorevideo_block':
                return {
                    title: langData.title,
                    video: content.media_url,
                    link: resolveBlockLink(content.targetLink?.target_type, content.targetLink?.target_data),
                }
            case 'exploreZoomImage_block': {
                const newHotspots = content.hotspots.map((item) => ({
                    id: item.id,
                    top: `${item.position.top}%`,
                    left: `${item.position.left}%`,
                    zoomX: `${item.zoom.x}%`,
                    zoomY: `${item.zoom.y}%`,
                    scale: item.scale,
                    title: lang === "vi" ? item.title.vi : item.title.en,
                    desc: lang === "vi" ? item.desc.vi : item.desc.en,
                }));
                return {
                    title: langData.title,
                    desc: langData.desc,
                    img: content.media_url,
                    link: resolveBlockLink(content.targetLink?.target_type, content.targetLink?.target_data),
                    hotspots: newHotspots,
                    more: lang === "vi" ? "Khám phá thêm" : "Explore more"
                }
            }
            case 'exploreSlide_block': {
                const newItems = content.items.map((item) => ({
                    id: item.id,
                    link: resolveBlockLink(item.targetLink?.target_type, item.targetLink?.target_data),
                    title: lang === 'vi' ? item.viTitle : item.enTitle,
                    desc: lang === "vi" ? item.viDesc : item.enDesc,
                    img: item.imgUrl
                }));
                return {
                    title: lang === 'vi' ? content.heading.viHeading.heading : content.heading.enHeading.heading,
                    items: newItems
                }
            }
            case 'exploreColor_block': {
                const newItems = content.items.map((item) => ({
                    link: resolveBlockLink(item.targetLink?.target_type, item.targetLink?.target_data),
                    linkState: { titleVi: item.viName, titleEn: item.enName },
                    id: item.id,
                    color: item.color,
                    name: lang === "vi" ? item.viName : item.enName
                }));
                return {
                    title: lang === 'vi' ? content.heading.viHeading.title : content.heading.enHeading.title,
                    items: newItems
                }
            }
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