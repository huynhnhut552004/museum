import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import authApi from "../../../api/authApi";

export default function Nav(){
    const [mobile, setMobile] = useState(false);
    const [menu, setMenu] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(()=>{
        const handleResize = () => {
            if(window.innerWidth < 1024){
                setMobile(true);
                setMenu(false);
            } else if(window.innerWidth > 1024) {
                setMobile(false);
                setMenu(true);
            }
        };
         handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    },[]);

    const toggleMenu = (e) => {
        e.preventDefault();
        setMenu(!menu);
    }

    const logout = async(e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authApi.logout();
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.dispatchEvent(new Event("authChange"));
            navigate('/');
        } catch (error) {
            console.log('Có lỗi khi đăng xuất!', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const out= (e) =>{
        e.preventDefault();
        navigate('/');
    };

    return(
        <nav className={` ${mobile ? "" : "w-[25%]"} z-50`}>
            <Link to="/admin" className={`${mobile ? "block" : "hidden"} flex justify-between px-2 items-center border border-gray-800 shadow-xl`}>
                <div className="">
                    <button type="button" onClick={toggleMenu} className="p-2"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
                </div>
                <div className="heading text-black">
                    Trang Quản Trị
                </div>
            </Link>
            <div className={`shadow-xl shadow-black ${mobile ? "h-auto" : "h-screen p-2"} items-center bg-[#191B1D] ${menu ? "flex absolute left-0" : "hidden"}`}>
                <div className="flex flex-col h-[90vh] w-full justify-between p-2">
                    <Link to="/admin" className={` ${mobile ? "hidden" : "flex"} flex-1 items-center gap-2 border-b-[2px] border-gray-400 pb-10`}>
                        <div className="w-16">
                            <img src="/User/icon/Gear.png" alt="img" className="w-full h-auto"/>
                        </div>
                        <div className="heading flex-1 text-center lg:text-left">
                            Trang Quản Trị
                        </div>
                    </Link>
                     
                    <div className="heading-nav flex-1 flex flex-col justify-around p-2 border-b-[2px] border-gray-400">
                        <Link to="/admin/user" className="lg:hover:bg-gray-400 p-2 rounded-md cursor-pointer transform-all duration-300 ease-out">
                            Người dùng
                        </Link>
                        <Link to="/admin/submission" className="lg:hover:bg-gray-400 p-2 rounded-md cursor-pointer transform-all duration-300 ease-out">
                            Câu hỏi
                        </Link>
                    </div>
                    <div className="heading-nav flex-1 flex flex-col justify-around p-2 border-b-[2px] border-gray-400">
                        <Link to="/admin/artwork" className="lg:hover:bg-gray-400 p-2 rounded-md cursor-pointer transform-all duration-300 ease-out">
                            Tác phẩm 
                        </Link>
                        <Link to="/admin/category" className="lg:hover:bg-gray-400 p-2 rounded-md cursor-pointer transform-all duration-300 ease-out">
                            Danh mục
                        </Link>
                    </div>
                    <div className="heading-nav flex-1 flex flex-col p-2 justify-around border-b-[2px] border-gray-400">
                        <Link to="admin/event" className="lg:hover:bg-gray-400 p-2 rounded-md cursor-pointer transform-all duration-300 ease-out">
                            Sự kiện
                        </Link>
                        <div className="lg:hover:bg-gray-400 p-2 rounded-md cursor-pointer transform-all duration-300 ease-out">
                            Nội dung web
                        </div>
                    </div>
                    <div className="heading-nav flex p-2 justify-around">
                        <div className="flex-1">
                            <button type="button" onClick={logout} className="lg:hover:bg-red-300 transform-all duration-300 ease-out text-red-600 rounded-md p-2 cursor-pointer" >Đăng xuất</button>
                        </div>
                        <div className="w-24">
                            <button type="button" onClick={out} className="lg:hover:bg-gray-400 p-2 rounded-md cursor-pointer transform-all duration-300 ease-out" >Thoát</button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}