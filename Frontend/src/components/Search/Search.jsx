import PageTransition from "../Animation/AnimatedPage";
import { useLocation } from "react-router-dom";

export default function SearchLayout({items}){
    const location= useLocation();
    const digital= location.pathname === "/digital/search";
    return (
        <PageTransition>
            <div className="max-w-6xl lg:flex items-start mx-auto pb-10 lg:space-y-6 space-y-4 lg:px-0 px-4">
                <div className="flex gap-2 lg:gap-8 lg:items-center flex-1 flex-col lg:flex-row ">
                    <div className="w-[80%] lg:w-[60%]">
                        <input type="text" placeholder="Nhập từ khoá bạn tìm..." className={`${digital ? "Digital-Login-Input" : "Classic-Login-Input"}`}/>
                    </div>
                    <div className="flex-1">
                        <select name="" id="" className={`${digital ? "Digital-Text1 text-gray-600 border-white" : "Style-Text1 border-black"} rounded-xl bg-inherit border p-[2%]`}>
                            <option value="">Tác phẩm</option>
                            <option value="">Thể loại</option>
                            <option value="">Nghệ sĩ</option>
                        </select>
                    </div>
                </div>
                <div className="lg:w-[30vw]">
                <div className={`${digital ? "Digital-Heading" : "Style-Heading2"}`}>
                    Có thể bạn đang tìm
                </div>
                <div className={`flex flex-col ${digital ? "Digital-Text1" : "Style-Text1"}`} >
                    {items.map((item, index)=>(
                        <div key={index} className="cursor-pointer lg:hover:text-black duration-300 ease-in-out">{item}</div>
                    ))}
                </div>
                </div>
            </div>
        </PageTransition>
    )
}