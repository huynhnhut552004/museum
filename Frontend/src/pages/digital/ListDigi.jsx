import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { searchClient } from "../../api/algoliaClient";
import PageTransition from "../../components/comon/Animation/AnimatedPage";
import { useLanguage } from "../../routes/LanguageContext";
import GalleyRoom from "./GalleryRoom";
import LostConnection from "../../components/LostConnection";

export default function ListDigital() {
    const { keyWord } = useParams();
    const searchParam = keyWord;
    const [item, setItem] = useState([]);
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { lang } = useLanguage();
    const location = useLocation();
    const passedState = location.state;
    const [noGetArtwork, setNoGetArtwork] = useState('');

    const fetchData = useCallback(async () => {
        if (!searchParam) return;
        setIsLoading(true);
        setNoGetArtwork('');
        try {
            const res = await searchClient.searchSingleIndex({
                indexName: 'artworks',
                searchParams: {
                    query: `${searchParam} digital`,
                    hitsPerPage: 10
                }
            });
            const rawHits = res.hits || [];
            const formatItems = rawHits.map(hit => ({
                id: hit.objectID,
                title_vi: hit.title,
                title_en: hit.title_en,
                description_vi: hit.description,
                description_en: hit.description_en,
                media_url: hit.thumbnail || hit.media_url,
                slug: hit.slug
            }));

            setItem(formatItems);
        } catch (error) {
            setNoGetArtwork('Lỗi dữ liệu!');
        } finally {
            setIsLoading(false);
        }
    }, [searchParam]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (passedState) {
            setTitle(lang === "vi" ? (passedState.vi || "") : (passedState.en || ""));
        } else {
            setTitle(searchParam || "");
        }
    }, [lang, passedState, searchParam]);

    const displayItems = item.map(i => ({
        ...i,
        title: (lang === 'en' && i.title_en) ? i.title_en : i.title_vi,
        description: (lang === 'en' && i.description_en) ? i.description_en : i.description_vi,
    }));

    if (isLoading) return (<div className="h-screen -mt-4 Digital-Heading flex items-center justify-center">{lang === "vi" ? "Đang tải..." : "Loading..."}</div>);
    if (noGetArtwork) return (<LostConnection click={fetchData} lang={lang} />);

    return (
        <PageTransition>
            <GalleyRoom
                items={displayItems}
                title={title}
                lang={lang}
            />
        </PageTransition>
    );
}

