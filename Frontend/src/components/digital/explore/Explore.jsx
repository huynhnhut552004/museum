import { useRef, useState, useEffect, useCallback } from "react";
import { useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import contentApi from "../../../api/contentApi";
import Item from "./Item";

export default function Explore({ lang, onHeadingLoad }) {
    const scroll = useScroll();
    const groupRef = useRef();
    const [content, setContent] = useState([]);

    const formatPropsforContent = useCallback((data) => {
        return {
            id: data.id,
            type: data.type || "image",
            position: Array.isArray(data.position) ? data.position : [data.position?.x || 0, data.position?.y || 0, data.position?.z || 0],
            url: data.media_url || data.imgUrl,
            title: lang === "vi" ? data.viTitle : data.enTitle,
            keyWord: data.keyWord,
            state: { vi: data.viTitle, en: data.enTitle }
        }
    }, [lang]);

    useEffect(() => {
        contentApi.get('exploreDigital').then(res => {
            const blockData = res.data?.data?.[0] || {};
            const contentData = blockData.content || {};
            const rawItems = contentData.items || [];
            const formattedData = rawItems.map(item => formatPropsforContent(item));
            setContent(formattedData);
            if (onHeadingLoad && contentData.heading) {
                const text = lang === "vi" ? contentData.heading.viHeading?.heading : contentData.heading.enHeading?.heading;
                if (text) onHeadingLoad(text);
            }
        }).catch(err => console.error("Lỗi fetch API Explore:", err));
    }, [formatPropsforContent, lang, onHeadingLoad]);

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data?.type === 'SYNC_PREVIEW_DATA') {
                const { data, focusZ } = event.data;
                setContent(data);
                if (focusZ !== null && scroll.el && data.length > 0) {
                    const lastItemZ = Math.abs(data[data.length - 1].position[2]);
                    const depth = lastItemZ + 5;
                    let targetOffset = (-focusZ - 7) / depth;
                    targetOffset = Math.max(0, Math.min(1, targetOffset));
                    const maxScroll = scroll.el.scrollHeight - scroll.el.clientHeight;
                    scroll.el.scrollTo({
                        top: targetOffset * maxScroll,
                        behavior: "smooth"
                    });
                }
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [scroll.el]);

    useFrame(() => {
        if (content.length === 0) return;
        const lastItem = Math.abs(content[content.length - 1].position[2]);
        const depth = lastItem + 5;
        groupRef.current.position.z = scroll.offset * depth + 2;
    });

    return (
        <group ref={groupRef}>
            {content.map((art) => (
                <Item
                    key={art.id}
                    type={art.type}
                    keyWord={art.keyWord}
                    url={art.url}
                    title={art.title}
                    position={art.position}
                    state={art.state}
                />
            ))}
        </group>
    );
}