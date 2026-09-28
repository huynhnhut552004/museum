import AboutIntro from "../../components/about/AboutIntro";
import AboutOutro from "../../components/about/AboutOutro";
import AboutVision from "../../components/about/AboutVision";
import PageTransition from "../../components/comon/Animation/AnimatedPage";
import React, { useState, useEffect } from 'react';
import contentApi from '../../api/contentApi';
import LostConnection from "../../components/LostConnection";
import { useLanguage } from "../../routes/LanguageContext";

const LayoutRegistry = {
  'aboutIntro_block': AboutIntro,
  'aboutVision_block': AboutVision,
  'aboutOutro_block': AboutOutro
};

const Style = {
  heading: "Digital-Heading",
  text: "Digital-Text1",
}

export default function About() {
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { lang } = useLanguage();
  const [err, setErr] = useState(null);

  const fetchData = () => {
    setIsLoading(true);
    setErr(null);
    contentApi.get('about')
      .then(res => setBlocks(res.data.data || []))
      .catch(error => setErr('Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) return (<div className="h-screen Digital-Heading flex items-center justify-center">{lang === "vi" ? "Đang tải..." : "Loading..."}</div>);

  if (err) return (<LostConnection click={fetchData} lang={lang} />)

  return (
    <PageTransition>
      {blocks.map(block => {
        const Layout = LayoutRegistry[block.block_type];
        if (!Layout) return null;
        const content = block.content || {};
        const langData = content[lang] || {};
        return (
          <Layout key={block.id} {...langData} img={content.media_url || content.img} style={Style} />
        )
      })}
    </PageTransition>
  )
}