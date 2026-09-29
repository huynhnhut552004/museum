import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import apiClient from "../../api/axiosClient";
import { useLanguage } from "../../routes/LanguageContext";

export default function HeaderDigi() {
    const [more, setMore] = useState(false);
    const [token, setToken] = useState(false);
    const [admin, setAdmin] = useState(false);
    const { lang, toggleLanguage } = useLanguage();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await apiClient.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/user`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                setToken(true);
                if (res.data.data.role === 'admin' || res.data.data.role === 'viewer') setAdmin(true);
            } catch (error) {
                setAdmin(false);
                setToken(false);
                console.error("Lỗi khi lấy profile:", error.response?.data || error.message);
            }
        };
        fetchData();
    }, []);

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
                    <div className=''>
                        <button onClick={toggleLanguage} className='lg:hover:text-[#a8a8a8] transition-all duration-300 ease-in-out'>{lang === "vi" ? "VI" : "EN"}</button>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Link to="/digital/search" className="lg:hover:text-[#a8a8a8] transition-all duration-300 ease-in-out">{lang === "vi" ? "Tìm Kiếm" : "Search"}</Link>
                        <Link to="/digital/search"><img src='/User/icon/Search.png' alt='Search' className='lg:w-4 lg:h-4 w-7 h-7 mt-1 invert' /></Link>
                    </div>
                    <div className="">
                        <Link to="/digital/event" className="whitespace-nowrap lg:hover:text-[#a8a8a8] transition-all duration-300 ease-in-out">{lang === "vi" ? "Diễn đàn & sự kiện" : "Forums & events"}</Link>
                    </div>
                    <div className="">
                        <Link to="/digital/explore" className="whitespace-nowrap lg:hover:text-[#a8a8a8] transition-all duration-300 ease-in-out">{lang === "vi" ? "Khám phá thêm" : "Explore more"}</Link>
                    </div>
                    <div className={admin ? "hidden" : "block"}>
                        <div className={token ? "hidden" : "block"}>
                            <Link to="/digital/login" className='lg:hover:text-[#a8a8a8] transition-all duration-300 ease-in-out'>{lang === "vi" ? "Đăng  nhập" : "Login"}</Link>
                        </div>
                        <div className={token ? "block" : "hidden"}>
                            <Link to="/digital/account" className='lg:hover:text-[#a8a8a8] transition-all duration-300 ease-in-out'>{lang === "vi" ? "Hồ sơ của bạn" : "Profile"}</Link>
                        </div>
                    </div>
                    <div className={admin ? "block" : "hidden"}>
                        <Link to="/admin" className='lg:hover:text-[#a8a8a8] transition-all duration-300 ease-in-out'>{lang === "vi" ? "Quản Trị" : "Admin"}</Link>
                    </div>
                </div>
                <div className="lg:hidden">
                    <div className="pl-6">
                        <button onClick={toggleMenu} className="focus:outline-none"><img src="/User/icon/More.png" alt="More" className="w-full h-full" /></button>
                    </div>
                </div>
                {more && (
                    <div className="absolute top-[60px] right-0 w-[250px] text-lg bg-[#f5f5f3] border border-gray-800 shadow-2xl flex flex-col items-start py-4 px-6 gap-4 z-40 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex justify-between w-full">
                            <div className="flex w-full justify-between items-center border-b border-gray-300 pb-2">
                                <span className="font-bold text-gray-500">Menu</span>
                            </div>
                            <div className="">
                                <button onClick={toggleLanguage} className="text-base">{lang === "vi" ? "VI" : "EN"}</button>
                            </div>
                        </div>
                        <Link to="/digital/search" onClick={closeMenu} className="flex items-center gap-3 w-full hover:text-[#a8a8a8] transition-colors">
                            <img src='/User/icon/Search.png' alt='Search' className='w-5 h-5 invert' />
                            {lang === "vi" ? "Tìm Kiếm" : "Search"}
                        </Link>
                        <Link to="/digital/event" onClick={closeMenu} className="w-full hover:text-[#a8a8a8] transition-colors">
                            {lang === "vi" ? "Diễn đàn & sự kiện" : "Forums & events"}
                        </Link>
                        <Link to="/digital/explore" onClick={closeMenu} className="w-full hover:text-[#a8a8a8] transition-colors">
                            {lang === "vi" ? "Khám phá thêm" : "Explore more"}
                        </Link>
                        <div className={admin ? "hidden" : "block"}>
                            <Link to="/digital/login" onClick={closeMenu} className={`${token ? "hidden" : "block"} w-full font-bold text-[#191B1D] border-t border-gray-300 pt-2 hover:text-[#a8a8a8] transition-colors`}>
                                {lang === "vi" ? "Đăng  nhập" : "Login"}
                            </Link>
                            <Link to="/digital/account" onClick={closeMenu} className={`${token ? 'block' : 'hidden'} w-full font-bold text-[#191B1D] border-t border-gray-300 pt-2 hover:text-[#a8a8a8] transition-colors`}>
                                {lang === "vi" ? "Hồ sơ của bạn" : "Profile"}
                            </Link>
                        </div>
                        <div className={admin ? "block" : "hidden"}>
                            <Link to="/admin" onClick={closeMenu} className={`${token ? 'block' : 'hidden'} w-full font-bold text-[#191B1D] border-t border-gray-300 pt-2 hover:text-[#a8a8a8] transition-colors`}>
                                Admin
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header >
    )
}