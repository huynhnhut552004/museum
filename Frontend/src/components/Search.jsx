import { useLocation, useNavigate } from "react-router-dom";
import searchApi from "../api/searchApi";
import { useState, useEffect } from "react";
import artworkApi from "../api/artworkApi";

export default function SearchLayout({ content, lang }) {
    const location = useLocation();
    const navigate = useNavigate();
    const digital = location.pathname === "/digital/search";
    const [hotKeys, setHotKeys] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [searchResults, setSearchResults] = useState(null);

    useEffect(() => {
        const layoutType = digital ? 'digital' : 'classic';
        const fetchHotKeys = async () => {
            try {
                const response = await searchApi.getHot(layoutType);
                const rawData = response.data?.data || response.data;
                const finalData = Array.isArray(rawData) ? rawData : [];
                setHotKeys(finalData);
            } catch {
                setHotKeys([]);
            }
        };
        fetchHotKeys();
    }, [digital]);

    const handleSearch = async (searchWord) => {
        if (!searchWord.trim()) return;
        try {
            const layoutType = digital ? 'digital' : 'classic';
            const response = await artworkApi.get(1, 20, null, searchWord, null, layoutType, lang);
            const results = response.data?.data || response.data || [];
            setSearchResults(Array.isArray(results) ? results : []);
        } catch {
            setSearchResults([]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSearch(keyword);
    };

    const handleHotKeyClick = (slug, fallbackText) => {
        if (!slug) {
            setKeyword(fallbackText);
            handleSearch(fallbackText);
            return;
        }
        const layoutType = digital ? 'digital' : 'classic';
        if (layoutType === "classic") {
            navigate(`/artwork/${slug}`);
        } else {
            navigate(`/digital/artwork/${slug}`);
        }
    };

    const handleArtworkClick = async (slug, clickedText) => {
        const layoutType = digital ? 'digital' : 'classic';
        try {
            if (clickedText && clickedText.trim()) await searchApi.click(clickedText, layoutType);
        } catch {
            console.warn("Search click tracking failed.");
        } finally {
            if (layoutType === "classic") {
                navigate(`/artwork/${slug}`);
            } else {
                navigate(`/digital/artwork/${slug}`);
            }
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setKeyword(value);
        if (!value.trim()) {
            setSearchResults(null);
        }
    };

    return (
        <div className="max-w-6xl lg:flex items-start mx-auto pb-10 lg:space-y-6 space-y-4 lg:px-0 px-4">
            <div className="flex gap-2 lg:gap-8 lg:items-center flex-1 flex-col lg:flex-row ">
                <div className="w-[80%] lg:w-[60%] flex gap-2 items-center">
                    <input type="text" value={keyword} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder={content.input} className={`flex-1 w-full ${digital ? "Digital-Login-Input" : "Classic-Login-Input"}`} />
                    <button onClick={() => handleSearch(keyword)} className={` p-2 ${digital ? "Digital-Login-Button" : "Classic-Login-Button font-cabin"} transition-all duration-300 ease-out lg:hover:scale-[1.02] lg:hover:-translate-y-[2px] lg:hover:shadow-lg`}>{content.button}</button>
                </div>
            </div>
            <div className="lg:w-[30vw]">
                {searchResults === null ? (
                    <>
                        <div className={`${digital ? "Digital-Heading" : "Style-Heading2"}`}>
                            {content.title1}
                        </div>
                        <div className={`flex flex-col ${digital ? "Digital-Text1" : "Style-Text1"}`}>
                            {hotKeys.length > 0 ? (
                                hotKeys.map((item, index) => {
                                    const parts = item.keyword?.split('|');
                                    const hasSlug = parts.length > 1;
                                    const slug = hasSlug ? parts[0] : null;
                                    const displayName = hasSlug ? parts[1] : parts[0];
                                    return (
                                        <div key={index} onClick={() => handleHotKeyClick(slug, displayName)} className="cursor-pointer lg:hover:text-black duration-300 ease-in-out">
                                            {displayName}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-gray-500 opacity-70">{content.noTrend}</div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div className={`${digital ? "Digital-Heading" : "Style-Heading2"}`}>
                            {content.title2}
                        </div>
                        <div className={`flex flex-col ${digital ? "Digital-Text1" : "Style-Text1"}`}>
                            {searchResults.length > 0 ? (
                                searchResults.map((item) => {
                                    const title = lang === "vi" ? item?.title : item?.title_en;
                                    const displayName = item?.artist_display_name ? `${title} (${item?.artist_display_name})` : title;
                                    const trackString = `${item.slug}|${displayName}`;
                                    return (
                                        <div key={item.id} onClick={() => handleArtworkClick(item.slug, trackString)} className="cursor-pointer lg:hover:text-black duration-300 ease-in-out py-1">
                                            {lang === "vi" ? item?.title : item?.title_en}
                                            {item?.artist_display_name && (<span className="text-base ml-2">({item?.artist_display_name})</span>)}
                                        </div>
                                    );
                                })
                            ) : (
                                <div>{content.error}</div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}