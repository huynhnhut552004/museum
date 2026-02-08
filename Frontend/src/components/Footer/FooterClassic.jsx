import { Link } from "react-router-dom";
export default function FooterClassic() {
  return (
    <footer className="bg-[#665C4A] text-white lg:py-12 py-6 lg:px-6 px-4">
      <div className={`max-w-7xl font-playfair lg:text-lg mx-auto grid grid-cols-[1fr_45%] grid-rows-[1fr_1fr] lg:grid-cols-[40%_40%_1fr] lg:grid-rows-[30px_1fr]`}>
        <div className='hidden lg:block lg:order-1'>Theo dõi chúng tôi tại:</div>
        <div className='hidden lg:block lg:order-2'>Liên hệ với chúng tôi:</div>
        <nav className='flex flex-col lg:gap-2 gap-1 row-span-2 pt-1 lg:px-6 lg:border-l text-lg select-none lg:order-3 order-1'>
          <Link to='/rule' className='lg:hover:text-[#a8a8a8] transition-all duration-300 ease-in-out'>Điều khoản & chính sách</Link>
          <Link to='/about' className='lg:hover:text-[#a8a8a8] transition-all duration-300 ease-in-out'>Về chúng tôi</Link>
          <Link to='/contact' className='lg:hover:text-[#a8a8a8] transition-all duration-300 ease-in-out'>Liên hệ</Link>
          <Link to='/feedback' className='lg:hover:text-[#a8a8a8] transition-all duration-300 ease-in-out'>Phản hồi của bạn</Link>
        </nav>
        <div className='flex flex-col lg:flex-row lg:flex gap-3 pt-2 lg:order-4 order-2 row-span-3 lg:items-start items-end px-8 lg:px-0'>
          <Link to='#' target="_blank" rel="noopener noreferrer"><img src='/User/icon/Facebook.png' alt='Facebook' className='lg:w-10 lg:h-10 w-8 h-8'/></Link>
          <Link to='#' target="_blank" rel="noopener noreferrer"><img src='/User/icon/Instagram.png' alt='Instagram' className='lg:w-10 lg:h-10 w-8 h-8'/></Link>
          <Link to='#' target="_blank" rel="noopener noreferrer"><img src='/User/icon/Pinterest.png' alt='Pinterest' className='lg:w-10 lg:h-10 w-8 h-8'/></Link>
          <Link to='#' target="_blank" rel="noopener noreferrer"><img src='/User/icon/Tiktok.png' alt='Tiktok' className='lg:w-10 lg:h-10 w-8 h-8'/></Link>
          <Link to='#' target="_blank" rel="noopener noreferrer"><img src='/User/icon/X.png' alt='Twitter' className='lg:w-10 lg:h-10 w-8 h-8'/></Link>
          <Link to='#' target="_blank" rel="noopener noreferrer"><img src='/User/icon/Youtube.png' alt='Youtube' className='wlg:w-10 lg:h-10 w-8 h-8'/></Link>
        </div>
        <div className="lg:order-5 order-3 lg:border-none border-t mt-4 pt-4 lg:mt-0 lg:pt-0">
          <p>070698xxxx</p>
          <p>094618xxxx</p>
          <p>mosaicmuseum@gmail.com</p>
          <p>mosaic2025@gmail.com</p>
        </div>
      </div>
      <div className="text-center text-gray-400 mt-8 lg:mt-10 text-sm">
        © 2025 Mosaic Museum. All rights reserved.
      </div>
    </footer>
  );
}