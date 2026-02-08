import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HeroScroll = () => {
  const canvasRef = useRef(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // 1. CẤU HÌNH CƠ BẢN
  const frameCount = 74; // Số lượng ảnh gốc
  const loopCount = 3;   // Số lần bạn muốn lặp lại (3 lần)
  
  // Tính tổng số frame ảo sẽ chạy (74 * 3 = 222 frame)
  const totalFrames = frameCount * loopCount; 

  const currentFrame = (index) => 
    `/Sequence/frame_${index.toString().padStart(4, '0')}.webp`;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Mảng chứa ảnh
    const images = [];
    let loadedCount = 0;

    // Hàm check để ẩn loading
    const checkLoad = () => {
      loadedCount++;
      if (loadedCount === frameCount) {
        setImagesLoaded(true);
      }
    };

    // 2. LOAD ẢNH THEO THỨ TỰ NGƯỢC (74 -> 1)
    // Chạy i từ 0 đến 73
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      
      // LOGIC ĐẢO NGƯỢC:
      // Khi i = 0 -> Lấy ảnh 74
      // Khi i = 73 -> Lấy ảnh 1
      const fileNumber = frameCount - i; 
      
      img.src = currentFrame(fileNumber);
      
      img.onload = checkLoad;
      img.onerror = () => {
        console.error(`Lỗi ảnh số: ${fileNumber}`);
        checkLoad(); // Bỏ qua lỗi để không treo
      };
      
      images.push(img); 
      // Kết quả: images[0] là ảnh 74, images[1] là ảnh 73...
    }

    const renderData = { frame: 0 };

    if (imagesLoaded) {
      canvas.width = 1280;
      canvas.height = 720;

      // Vẽ frame đầu tiên (Chính là ảnh 74)
      context.drawImage(images[0], 0, 0, canvas.width, canvas.height);

      gsap.to(renderData, {
        // Chạy từ 0 đến tổng số frame đã nhân 3
        frame: totalFrames - 1, 
        snap: "frame",
        ease: "none",
        scrollTrigger: {
          trigger: canvas,
          start: "top top",
          // Tăng độ dài cuộn lên gấp 3 để tốc độ không bị quá nhanh
          // Bạn có thể chỉnh số 6000 này tuỳ ý thích nhanh/chậm
          end: "+=6000", 
          scrub: 1,
          pin: true,
        },
        onUpdate: () => {
          // 3. LOGIC LẶP LẠI (LOOP)
          // Dùng toán tử % (chia lấy dư)
          // Ví dụ: Đang ở frame 75 -> 75 % 74 = dư 1 -> Vẽ ảnh số 1 (images[1])
          const loopIndex = Math.round(renderData.frame) % frameCount;
          
          const img = images[loopIndex];
          if (img) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
        },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [imagesLoaded]);

  return (
    <div className='h-screen bg-[#000] relative z-10'>
      {!imagesLoaded && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          display: 'flex', justifyContent: 'center', alignItems: 'center', 
          color: 'white', zIndex: 99, background: 'black' 
        }}>
          <h2>Loading Museum Assets...</h2>
        </div>
      )}

      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100vh', objectFit: 'cover' }} 
      />
      <div style={{ height: '100vh', background: '#111', color: '#fff', padding: '50px' }}>
        <h2>Welcome to Mosaic Museum</h2>
        <p>Scroll down to explore more...</p>
      </div>
    </div>
  );
};

export default HeroScroll;