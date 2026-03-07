import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import apiClient from '../../api/axiosClient';

export default function HeaderClass() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [token, setToken] = useState(false);
  const [admin, setAdmin] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
    try {
      const res = await apiClient.get(
        "http://localhost:5000/api/user",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setToken(true);
      if(res.data.data.role === 'admin'){
        setAdmin(true);
      }
    } catch (error) {
      setAdmin(false);
      setToken(false);
      console.error("Lỗi khi lấy profile:", error.response?.data || error.message);
    }
  };
    fetchData();
    window.addEventListener("authChange", fetchData);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener("authChange", fetchData);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed select-none top-0 left-0 w-full z-50 shadow-lg transition-all duration-500 ease-in-out border-b border-gray-800 bg-[#0F3A32] ${isScrolled ? 'h-[70px]' : 'h-[150px] lg:h-[200px]'
        }`}
    >
      <div className={`relative w-full max-w-7xl mx-auto h-full lg:px-6 px-4 font-playfair`}>
        <div className={`absolute lg:top-6 top-2 lg:w-full w-[90%] flex justify-between items-center text-white transition-all duration-500 ${isScrolled ? 'opacity-0 pointer-events-none -translate-y-5' : 'opacity-100 translate-y-0'}`}>
          <div className='flex gap-2 cursor-pointer items-center'>
            <span className='lg:hover:text-[#a8a8a8] hidden lg:block transition-all duration-300 ease-in-out text-xl'><Link to="search">Tìm Kiếm</Link></span>
            <Link to="search"><img src='/User/icon/Search.png' alt='Search' className='lg:w-5 lg:h-5 w-7 h-7 mt-1' /></Link>
          </div>
          <div className={admin ? 'hidden' : 'block'}>
            <div className={`flex gap-6 items-center ${token ? "hidden" : "block"}`}>
              <Link to="/login" className='lg:hover:text-[#a8a8a8] transition-all duration-300 ease-in-out lg:text-xl text-lg '>Đăng nhập</Link>
            </div>
            <div className={`flex gap-6 items-center ${token ? "block" : "hidden"}`}>
              <Link to="/account" className='lg:hover:text-[#a8a8a8] transition-all duration-300 ease-in-out lg:text-xl text-lg '>Hồ sơ của bạn</Link>
            </div>
          </div>
          <div className={admin ? "block" : "hidden"}>
          <Link to="/admin" className='lg:hover:text-[#a8a8a8] transition-all duration-300 ease-in-out lg:text-xl text-lg '>Admin</Link>
        </div>
        </div>
        <div className={admin ? 'hidden' : 'block'}>
          <div className={token ? "hidden" : "block"}>
            <Link to="/login" className={`lg:hidden text-white absolute text-lg right-6 ${isScrolled ? 'block top-5' : 'hidden pointer-events-none'} `}>Đăng nhập</Link>
          </div>
          <div className={token ? "block" : "hidden"}>
            <Link to="/account" className={`lg:hidden text-white absolute text-lg right-6 ${isScrolled ? 'block top-5' : 'hidden pointer-events-none'} `}>Hồ sơ của bạn</Link>
          </div>
        </div>
        <div className={admin ? "block" : "hidden"}>
          <Link to="/admin" className={`lg:hidden text-white absolute text-lg right-6 ${isScrolled ? 'block top-5' : 'hidden pointer-events-none'} `}>Admin</Link>
        </div>
        <nav
          className={`absolute transition-all duration-700 ease-in-out flex gap-2 lg:gap-8 text-white ${isScrolled
              ? 'lg:top-1/2 lg:-translate-y-1/2 lg:right-6 lg:opacity-100 opacity-0 pointer-events-none lg:pointer-events-auto -translate-y-5 lg:flex'
              : 'lg:top-8 top-14 left-1/2 -translate-x-1/2 lg:text-xl'
            }`}>
          <Link to="/digital" className='lg:hover:text-[#a8a8a8] transition-all duration-300 ease-in-out whitespace-nowrap'>Nghệ thuật số</Link>
          <Link to="/event" className='lg:hover:text-[#a8a8a8] transition-all duration-300 ease-in-out whitespace-nowrap'>Diễn đàn & sự kiện</Link>
          <Link to="/explore" className='lg:hover:text-[#a8a8a8] transition-all duration-300 ease-in-out whitespace-nowrap'>Khám phá thêm</Link>
        </nav>
        <div
          className={`absolute transition-all duration-700 ease-in-out font-bold text-white whitespace-nowrap ${isScrolled
              ? 'top-1/2 -translate-y-1/2 left-6 lg:text-2xl text-2xl'
              : 'lg:top-[100px] top-[100px] left-1/2 -translate-x-1/2 lg:text-5xl text-3xl border-t border-gray-600 lg:pt-4 w-3/5 text-center'
            }`}
        >
          <Link to="/">Mosaic Museum</Link>
        </div>

      </div>
    </header>
  );
}