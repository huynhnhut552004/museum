import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import AnimatedSection from '../../comon/Animation/AnimatedSection';

export default function ZoomPoint({ img, title, desc, hotspots }) {
  const [zoomState, setZoomState] = useState({ scale: 1, x: 0, y: 0 });
  const [activeSpot, setActiveSpot] = useState(null);
  const handleSpotClick = (spot) => {
    setZoomState({
      scale: spot.scale,
      x: spot.zoomX,
      y: spot.zoomY,
    });
    setActiveSpot(spot);
  };
  const resetZoom = () => {
    setZoomState({ scale: 1, x: 0, y: 0 });
    setActiveSpot(null);
  };
  const isZoomed = zoomState.scale > 1;
  useEffect(() => {
    const handleScroll = () => {
      setZoomState((prev) => {
        if (prev.scale === 1) return prev;
        setActiveSpot(null);
        return { scale: 1, x: 0, y: 0 };
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return (
    <AnimatedSection>
      <div className='lg:hidden pb-2'>
        <div className="Style-Heading2 lg:hidden text-center">{title}</div>
        <div className="Style-Text1 lg:hidden text-center">{desc}</div>
        <Link to="#" className='Style-Text1 border-black underline text-center rounded-lg lg:hidden '>Khám phá thêm</Link>
      </div>
      <section className="relative pb-10 w-full lg:h-[90vh] h-[30vh] overflow-hidden group rounded-xl">
        <img src={img} draggable={false} alt="Img" className="w-full h-full object-cover transition-transform duration-700 ease-in-out will-change-transform lg:cursor-pointer" style={{ transform: `scale(${zoomState.scale}) translate(${zoomState.x}, ${zoomState.y})` }} onClick={resetZoom} />
        {hotspots.map(spot => (
          <button key={spot.id} onClick={(e) => { handleSpotClick(spot); e.stopPropagation() }} className={`absolute lg:w-12 lg:h-12 w-8 h-8 -ml-6 -mt-6 rounded-full border-2 border-white/80 lg:hover:bg-white/20 lg:hover:scale-110 transition-all duration-300 z-10 focus:outline-none ${isZoomed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ top: spot.top, left: spot.left }} aria-label="Phóng to chi tiết">
            <span className="absolute inset-0 h-full w-full hidden lg:block rounded-full lg:hover:bg-white opacity-40 lg:hover:animate-ping"></span>
          </button>
        ))}
        <div className={`absolute bottom-6 lg:block hidden left-0 p-8 text-white transition-opacity duration-500 ${isZoomed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="Style-Heading2 text-white lg:block hidden">{title}</div>
          <div className="Style-Text1 text-white lg:block hidden">{desc}</div>
          <Link to="#" className='Style-Text1 text-black hidden bg-white p-1 cursor-pointer rounded-lg transition-all duration-300 ease-out lg:inline-block hover:bg-gray-300 '>Khám phá thêm</Link>
        </div>
        <div className={`absolute lg:bottom-6 lg:left-6 bottom-1 left-1 lg:p-8 p-2 rounded-r-lg bg-black/30 border-l-4 transition-all duration-700 transform ${isZoomed && activeSpot ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
          {activeSpot && (
            <>
              <div className="Style-Heading2 text-white">{activeSpot.title}</div>
              <div className="Style-Text1 text-white">{activeSpot.desc}</div>
            </>
          )}
        </div>
      </section>
    </AnimatedSection>
  );
};