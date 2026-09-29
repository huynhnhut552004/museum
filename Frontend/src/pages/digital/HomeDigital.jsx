import React, { useState, useEffect } from 'react';
import contentApi from '../../api/contentApi';
import Section1 from '../../components/digital/home/Section1';
import Section2 from '../../components/digital/home/Section2';
import Section3 from '../../components/digital/home/Section3';
import Section4 from '../../components/digital/home/Section4';
import PageTransition from "../../components/comon/Animation/AnimatedPage";
import Section5 from '../../components/digital/home/Section5';
import LostConnection from '../../components/LostConnection';
import { useLanguage } from "../../routes/LanguageContext";

const LayoutRegistry = {
  'section 1': Section1,
  'section 2': Section2,
  'section 3': Section3,
  'section 4': Section4,
  'section 5': Section5
}

export default function HomeDigital() {
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { lang } = useLanguage();
  const [err, setErr] = useState(null);

  const fetchData = () => {
    contentApi.get('homeDigital')
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

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }, 0);
    }
  }, [isLoading]);

  const formatPropsForBlock = (content) => {
    const langData = content[lang] || {};
    return {
      title: langData?.title,
      desc: langData?.desc,
      img: content?.img?.img1?.imgUrl,
      bg: content?.img?.img2?.imgUrl,
      color: content?.color
    };
  };

  if (isLoading) return (<div className="h-screen Digital-Heading flex items-center justify-center">{lang === "vi" ? "Đang tải..." : "Loading..."}</div>);

  if (err) return (<LostConnection click={fetchData} lang={lang} />);

  return (
    <PageTransition>
      {blocks.map(block => {
        const Layout = LayoutRegistry[block.block_type];
        if (!Layout) return null;
        const formattedProps = formatPropsForBlock(block.content);
        return <div className='snap-section'><Layout key={block.id} {...formattedProps} /></div>
      })}
    </PageTransition>
  );
}
