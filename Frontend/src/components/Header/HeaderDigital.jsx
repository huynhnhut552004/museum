import { Link } from "react-router-dom";
import { useState } from "react";

export default function HeaderDigital() {
    const [lang, setlang] = useState('VI');
    const [more, setMore]= useState(false);
    const changelang = () => {
        setlang(lang === "VI" ? "EN" : "VI");
    };
    const toggleMenu = () => {
        setMore(!more);
    };
    const closeMenu = () => {
        setMore(false);
    };
    return (
        <header className="lg:h-[70px] h-[60px] z-50 text-[#191B1D] fixed top-0 left-0 shadow-lg border-b border-gray-800 w-full bg-[#f5f5f3] font-oswald">
            <div className="flex w-full h-full items-center justify-between max-w-[95%] mx-auto">
                <div className="lg:text-3xl text-2xl flex-1 font-bold">
                    <Link to="/">Mosaic Museum</Link>
                </div>
                <div className="h-full justify-between items-center hidden lg:flex w-[40%] text-lg">
                    <div className="flex gap-2 items-center">
                        <Link to="/digital/search" className="lg:hover:text-[#a8a8a8] transition-all duration-300 ease-in-out">Tìm Kiếm</Link>
                        <Link to="/digital/search"><img src='/User/icon/Search.png' alt='Search' className='lg:w-4 lg:h-4 w-7 h-7 mt-1 invert' /></Link>
                    </div>
                     <div className="">
                        <button type='button' onClick={changelang} className=' p-2 active:bg-[#a8a8a8] transition-all duration-300 ease-in-out rounded-full'>{lang}</button>
                    </div>
                    <div className="">
                        <Link to="#" className="whitespace-nowrap lg:hover:text-[#a8a8a8] transition-all duration-300 ease-in-out">Diễn đàn & sự kiện</Link>
                    </div>
                    <div className="">
                        <Link to="/digital/explore" className="whitespace-nowrap lg:hover:text-[#a8a8a8] transition-all duration-300 ease-in-out">Khám phá thêm</Link>
                    </div>
                    <div className="">
                        <Link to="/digital/login" className='lg:hover:text-[#a8a8a8] transition-all duration-300 ease-in-out'>Đăng nhập</Link>
                    </div>
                </div>
                <div className="lg:hidden">
                    <div className="pl-6">
                        <button onClick={toggleMenu} className="focus:outline-none"><img src="/User/icon/More.png" alt="More" className="w-full h-full"/></button>
                    </div>
                </div>
                {more && (
                    <div className="absolute top-[60px] right-0 w-[250px] text-lg bg-[#f5f5f3] border border-gray-800 shadow-2xl flex flex-col items-start py-4 px-6 gap-4 z-40 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex w-full justify-between items-center border-b border-gray-300 pb-2">
                             <span className="font-bold text-gray-500">Menu</span>
                             <button onClick={changelang} className='text-sm border border-gray-800 px-2 py-1 rounded hover:bg-gray-200'>{lang}</button>
                        </div>
                        <Link to="/digital/search" onClick={closeMenu} className="flex items-center gap-3 w-full hover:text-[#a8a8a8] transition-colors">
                            <img src='/User/icon/Search.png' alt='Search' className='w-5 h-5 invert' />
                            Tìm Kiếm
                        </Link>
                        <Link to="#" onClick={closeMenu} className="w-full hover:text-[#a8a8a8] transition-colors">
                            Diễn đàn & sự kiện
                        </Link>
                        <Link to="/digital/explore" onClick={closeMenu} className="w-full hover:text-[#a8a8a8] transition-colors">
                            Khám phá thêm
                        </Link>
                        <Link to="/digital/login" onClick={closeMenu} className="w-full font-bold text-[#191B1D] border-t border-gray-300 pt-2 hover:text-[#a8a8a8] transition-colors">
                            Đăng nhập
                        </Link>
                    </div>
                )}
            </div>
        </header >
    )
}