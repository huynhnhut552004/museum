import { Link } from "react-router-dom"
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
export default function Login({ style, animate }) {
    const [view, setView] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const slideAnimation = {
        initial: { x: 600, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -600, opacity: 0 },
        transition: {
            duration: 0.3,
            ease: "easeInOut"
        }
    }
    return (
        <div className={`${style.bg} text-black min-h-screen flex items-center overflow-hidden justify-center relative`}>
            <Link to={style.back} className={`absolute ${style.backcolor} top-8 left-8 md:text-4xl text-2xl underline md:no-underline font-josefin hover:underline duration-300 ease-in-out`}>← Trở về</Link>
            <style>{`
                    input::-ms-reveal,
                    input::-ms-clear {
                        display: none;
                    }
                    input::placeholder {
                        color: #6b7280;
                    }
                `}</style>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                {animate.map((item, index)=>(
                    <div key={index} className={item.class}/>
                ))}
            </div>
            <div className="relative w-full max-w-md min-h-[500px] md:min-h-[450px] md:px-0 px-4 bg-non flex flex-col ">
                <AnimatePresence mode="wait">
                    {view === 'login' && (
                        <motion.div key="login" {...slideAnimation} className="w-full relative">
                            <div className={`${style.heading}`}>Đăng nhập</div>
                            <form>
                                <div className="mt-10 space-y-1">
                                    <label className={`${style.label}`}>Tên tài khoản</label>
                                    <input type="text" placeholder="abcd@gmail.com" className={`${style.input}`}></input>
                                </div>
                                <div className="space-y-1 mt-8">
                                    <label className={`${style.label}`}>Mật khẩu</label>
                                    <input type={showPassword ? "text" : "password"} placeholder="123456xyz" className={`${style.input}`}></input>
                                    <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 bottom-[39%] -translate-y-1/2 cursor-pointer text-gray-400">
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                                <div className="mt-8">
                                    <button type="submit" className={`${style.button}`}>Đăng nhập</button>
                                </div>
                            </form>
                            <div className="flex -mt-9 gap-6">
                                <img src="/User/icon/Facebook_color.png" alt="Facebook" className="w-10 h-auto" />
                                <img src="/User/icon/Google.png" alt="Google" className="w-10 h-auto cursor-pointer" />
                                <img src="/User/icon/X.png" alt="Google" className={`w-10 h-auto cursor-pointer ${style.icon} `}/>
                                <img src="/User/icon/Apple.png" alt="Google" className={`w-10 h-auto cursor-pointer ${style.icon}`} />
                            </div>
                            <div className="font-josefin text-gray-500 mt-6 pl-2 space-y-2">
                                <button onClick={() => setView('forgot')} className="underline block hover:text-black transition-all duration-300 ease-in-out">Bạn quên mật khẩu?</button>
                                <button onClick={() => setView('register')} className="underline block hover:text-black transition-all duration-300 ease-in-out">Bạn chưa có tài khoản?</button>
                            </div>
                        </motion.div>
                    )}
                    {view === "forgot" && (
                        <motion.div key="forgot" {...slideAnimation} className="w-full relative">
                            <div className={`${style.heading}`}>Đặt lại mật khẩu</div>
                            <form className="mt-10 space-y-1">
                                <label className={`${style.label}`}>Nhập email</label><br></br>
                                <div className="flex gap-2 items-center">
                                    <div className="md:w-[70%] w-[60%]">
                                        <input type="text" placeholder="abcd@gmail.com" className={`${style.input}`}></input>
                                    </div>
                                    <div className="flex-1">
                                        <button type="submit" className={`${style.button} p-3`}>Xác nhận</button>
                                    </div>
                                </div>
                            </form>
                            <form>
                                <div className="space-y-1 mt-6">
                                    <label className={`${style.label}`}>Mật khẩu mới</label>
                                    <input type={showPassword ? "text" : "password"} placeholder="123456xyz" className={`${style.input}`}></input>
                                    <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 bottom-[44%] -translate-y-1/2 cursor-pointer text-gray-400">
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                                <div className="space-y-1 mt-2">
                                    <label className={`${style.label}`}>Xác nhận lại mật khẩu</label>
                                    <input type={showPassword ? "text" : "password"} placeholder="123456xyz" className={`${style.input}`}></input>
                                    <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 bottom-[25%] -translate-y-1/2 cursor-pointer text-gray-400">
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                                <div className="mt-6">
                                    <button type="submit" className={`${style.button} mx-auto`}>Đặt lại mật khẩu</button>
                                </div>
                            </form>
                            <button onClick={() => setView('login')} className="font-josefin text-gray-500 mx-auto mt-4 underline block hover:text-black transition-all duration-300 ease-in-out">Quay lại đăng nhập.</button>
                        </motion.div>
                    )}
                    {view === "register" && (
                        <motion.div key="register" {...slideAnimation} className="w-full relative">
                            <div className={`${style.heading}`}>Đăng ký</div>
                            <form>
                                <div className="grid grid-cols-2 grid-rows-[1fr_60px] mt-6 gap-x-2 space-y-1">
                                    <div className="order-1">
                                        <label className={`${style.label}`}>Họ</label>
                                    </div>
                                    <div className="order-3">
                                        <input type="text" className={`${style.input}`}></input>
                                    </div>
                                    <div className="order-2">
                                        <label className={`${style.label}`}>Tên</label>
                                    </div>
                                    <div className="order-4">
                                        <input type="text" className={`${style.input}`}></input>
                                    </div>
                                </div>
                                <div className="space-y-1 mt-1">
                                    <label className={`${style.label}`}>Nhập email</label>
                                    <input type="text" placeholder="abcd@gmail.com" className={`${style.input}`}></input>
                                </div>
                                <div className="space-y-1 mt-2">
                                    <label className={`${style.label}`}>Nhập mật khẩu</label>
                                    <input type={showPassword ? "text" : "password"} placeholder="123456xyz" className={`${style.input}`} />
                                    <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 bottom-[39%] -translate-y-1/2 cursor-pointer text-gray-400">
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                                <div className="space-y-1 mt-2">
                                    <label className={`${style.label}`}>Xác nhận lại mật khẩu</label>
                                    <input type={showPassword ? "text" : "password"} placeholder="123456xyz" className={`${style.input}`}/>
                                    <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 bottom-[21%] -translate-y-1/2 cursor-pointer text-gray-400">
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                                <button type="submit" className={`${style.button} mx-auto mt-6`}>Đăng ký</button>
                            </form>
                            <button onClick={() => setView('login')} className="font-josefin text-gray-500 mx-auto mt-4 underline block hover:text-black transition-all duration-300 ease-in-out">Quay lại đăng nhập.</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

