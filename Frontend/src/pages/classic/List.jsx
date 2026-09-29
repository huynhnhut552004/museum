import ListLayout from '../../components/List';
import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { searchClient } from '../../api/algoliaClient';
import PageTransition from '../../components/comon/Animation/AnimatedPage';
import { useLanguage } from '../../routes/LanguageContext';

const CLASSIC_FILTER = `layout_type:"classic"`;

const LOCAL_COUNTRIES = [
    'Việt Nam',
    'Vietnam',
    'Viet Nam',
    'VN'
];

const normalizeFacetValues = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.flatMap(item => String(item).split(',').map(value => value.trim())).filter(Boolean);
    return String(value).split(',').map(item => item.trim()).filter(Boolean);
};

const getFacetPairs = (viValue, enValue) => {
    const viValues = normalizeFacetValues(viValue);
    const enValues = normalizeFacetValues(enValue);
    return viValues.map((vi, index) => ({ vi, en: enValues[index] || '' }));
};


const hasFacetValue = (hit, facetKey, facetValue) => {
    const values = normalizeFacetValues(hit[facetKey]);
    return values.some(value => value === facetValue);
};

export default function List() {
    const { facetKey, facetValue } = useParams();
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { lang } = useLanguage();
    const location = useLocation();
    const passedState = location.state;

    useEffect(() => {
        const fetchAlgoliaData = async () => {
            setIsLoading(true);
            try {
                if (!facetKey) return;
                const res = await searchClient.searchSingleIndex({
                    indexName: 'artworks',
                    searchParams: {
                        filters: CLASSIC_FILTER,
                        hitsPerPage: 1000
                    }
                });
                if (facetValue) {
                    let matchedHits = [];
                    if (facetKey === 'country') {
                        if (facetValue === 'Quốc tế') {
                            matchedHits = res.hits.filter(hit => {
                                const countryValues = normalizeFacetValues(hit.country);
                                return !countryValues.some(country => LOCAL_COUNTRIES.includes(country));
                            });
                        } else if (LOCAL_COUNTRIES.includes(facetValue)) {
                            matchedHits = res.hits.filter(hit => {
                                const countryValues = normalizeFacetValues(hit.country);
                                return countryValues.some(country => LOCAL_COUNTRIES.includes(country));
                            });
                        } else {
                            matchedHits = res.hits.filter(hit => hasFacetValue(hit, facetKey, facetValue));
                        }
                    } else {
                        matchedHits = res.hits.filter(hit => hasFacetValue(hit, facetKey, facetValue)
                        );
                    }
                    const formattedItems = matchedHits.slice(0, 40).map(hit => ({
                        id: hit.objectID,
                        title: lang === 'en' && hit.title_en ? hit.title_en : hit.title,
                        media_url: hit.thumbnail || hit.media_url,
                        linkUrl: `/artwork/${hit.slug}`
                    }));
                    let displayTitle = '';
                    if (passedState) displayTitle = lang === 'vi' ? (passedState.vi || '') : (passedState.en || '');
                    if (!displayTitle) {
                        if (facetValue === 'Quốc tế') {
                            displayTitle = lang === 'en' ? 'International Works' : 'Quốc tế';
                        } else {
                            for (const hit of matchedHits) {
                                const viValues = normalizeFacetValues(hit[facetKey]);
                                const enValues = normalizeFacetValues(hit[`${facetKey}_en`]);
                                const index = viValues.indexOf(facetValue);
                                if (index !== -1) {
                                    displayTitle = lang === 'en' ? (enValues[index] || facetValue) : (viValues[index] || facetValue);
                                    break;
                                }
                            }
                            if (!displayTitle) displayTitle = facetValue;
                        }
                    }
                    setItems(formattedItems);
                    setTotal(matchedHits.length);
                    setTitle(displayTitle);
                    return;
                }
                const seenGroups = new Set();
                const formattedItems = [];
                res.hits.forEach(hit => {
                    const viValue = hit[facetKey];
                    const enValue = hit[`${facetKey}_en`];
                    if (!viValue) return;
                    const facetPairs = getFacetPairs(viValue, enValue);
                    facetPairs.forEach(({ vi, en }) => {
                        if (seenGroups.has(vi)) return;
                        seenGroups.add(vi);
                        const displayGroupName = lang === 'en' && en ? en : vi;
                        formattedItems.push({
                            id: hit.objectID,
                            title: displayGroupName,
                            media_url: hit.thumbnail || hit.media_url,
                            linkUrl: `/explore/${facetKey}/${encodeURIComponent(vi)}`,
                            stateData: { vi, en }
                        });
                    });
                });
                let defaultTitle = facetKey;
                if (passedState) {
                    defaultTitle = lang === 'vi' ? (passedState.vi || facetKey) : (passedState.en || facetKey);
                }
                setTitle(defaultTitle);
                setItems(formattedItems);
                setTotal(formattedItems.length);
                if (lang === 'en' && passedState?.titleEn) {
                    defaultTitle = passedState.titleEn;
                } else if (lang === 'vi' && passedState?.titleVi) {
                    defaultTitle = passedState.titleVi;
                }
                setTitle(defaultTitle);
            } catch (error) {
                console.error('Lỗi Algolia:', error);
                setItems([]);
                setTotal(0);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAlgoliaData();
    }, [facetKey, facetValue, lang, passedState]);

    const style = { heading: 'Style-Heading2', text: 'Style-Text1' };

    if (isLoading) {
        return (
            <div className="h-screen bg-black text-white flex items-center justify-center">{lang === 'vi' ? 'Đang tải dữ liệu...' : 'Loading...'}</div>
        );
    }

    return (
        <PageTransition>
            <ListLayout
                items={items}
                title={title}
                total={total}
                style={style}
                lang={lang}
            />
        </PageTransition>
    );
}