import ErrorNoti from "../../comon/Noti/Error";
import SuccessNoti from "../../comon/Noti/Success";
import categoryApi from "../../../api/categoryApi";
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";

export default function CustomCategoryLayout() {
    const [err, setErr] = useState('');
    const [succ, setSucc] = useState('');
    const [loading, setLoading] = useState(false);
    const [originalThreejs, setOriginalThreejs] = useState(null);
    const [deleted, setDeleted] = useState(false);
    const navigate = useNavigate();
    const [succPopup, setSuccPopup] = useState('');
    const [errPopup, setErrPopup] = useState('');
    const [form, setForm] = useState({ id:"", name: "", layout: "both" });
    const [threejs, setThreejs] = useState({ positionX: "", positionY: "", positionZ: "", rotationX: "", rotationY: "", rotationZ: "" });
    const { slug } = useParams();
    const isClassicLayout = form.layout === "classic";

    const handleApiError = (error) => {
        if (error.response) {
            console.log(error.response.data.message)
            const status = error.response.status;
            if (status === 401) setErr("Đăng nhập hết hạn, vui lòng đăng nhập lại!");
            else if (status === 404) setErr("Không tìm thấy dữ liệu!");
            else if (status === 409) setErr("Danh mục đã tồn tại!");
            else setErr("Lỗi hệ thống!");
        } else {
            setErr("Không thể kết nối đến Server!");
        }
    };

    const handleOnchange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
        if (err) setErr('');
        if (succ) setSucc('');
    };

    const threejsOnchange = (e) => {
        const { name, value } = e.target;
        setThreejs((prev) => ({
            ...prev,
            [name]: value
        }));
        if (err) setErr('');
        if (succ) setSucc('');
    };

    const getBySlug = async(slug) => {
        if(!slug) return;
        try {
            const res = await categoryApi.getBySlug(slug);
            const data = res.data.data;
            setForm({id: data.id, name: data.name, layout: data.layout_type});
            if(data.three_d_config){
            const config = {
                positionX: String(data.three_d_config.position.x),
                positionY: String(data.three_d_config.position.y),
                positionZ: String(data.three_d_config.position.z),
                rotationX: String(data.three_d_config.rotation.x),
                rotationY: String(data.three_d_config.rotation.y),
                rotationZ: String(data.three_d_config.rotation.z)
            };
            setThreejs(config);
            setOriginalThreejs(config);
        }
        } catch (error) {
            handleApiError(error)
        }
    };

    useEffect(()=>{
        getBySlug(slug);
    },[slug]);

    const parseNumber = (val) => (val !== "" && !isNaN(val)) ? parseFloat(val) : undefined;

    const custom = async (e) => {
        e.preventDefault();
        if (!form.name || !form.layout) {
            setErr("Vui lòng nhập đủ dữ liệu!");
            return;
        }
        setLoading(true);
        setErr('');
        setSucc('');
        const formattedThreeD = {
            scale: 1,
            position: {
                x: parseNumber(threejs.positionX),
                y: parseNumber(threejs.positionY),
                z: parseNumber(threejs.positionZ)
            },
            rotation: {
                x: parseNumber(threejs.rotationX),
                y: parseNumber(threejs.rotationY),
                z: parseNumber(threejs.rotationZ)
            }
        };

        try {
            if (slug) {
                await categoryApi.update(form.name, form.layout, form.id);
                const isDigital = form.layout === 'digital';
                const isChanged = originalThreejs && Object.keys(threejs).some(
                key => String(threejs[key]) !== String(originalThreejs[key])
                );
                const hasData = Object.values(threejs).some(val => val !== "" && val !== undefined);
                if (isDigital && isChanged && hasData) {
                const formattedThreeD = {
                    scale: 1,
                    position: {
                        x: parseNumber(threejs.positionX),
                        y: parseNumber(threejs.positionY),
                        z: parseNumber(threejs.positionZ)
                    },
                    rotation: {
                        x: parseNumber(threejs.rotationX),
                        y: parseNumber(threejs.rotationY),
                        z: parseNumber(threejs.rotationZ)
                    }
                };
                await categoryApi.update3D(form.id, formattedThreeD);
                setOriginalThreejs({...threejs});
            }
                setSucc('Cập nhật thành công!');
                setTimeout(()=>{
                    setSucc('');
                },2000);
            } else {
                await categoryApi.create(form.name, form.layout, formattedThreeD);
                setForm({ id:"", name: "", layout: "both" });
                setThreejs({ positionX: "", positionY: "", positionZ: "", rotationX: "", rotationY: "", rotationZ: "" });
                setSucc('Tạo danh mục thành công!');
                setTimeout(()=>{
                    setSucc('');
                },2000);
            }
        } catch (error) {
            setSucc('');
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const Delete = async(id) => {
        setLoading(true);
        setErrPopup('');
        setSuccPopup('');
        try {
            await categoryApi.delete(id);
            setSuccPopup('Xoá thành công!');
            setTimeout(()=>{
                navigate('/admin/category')
            },2000);
        } catch (error) {
            if(error.request){
                setErrPopup('Lỗi hệ thống!');
            }else{
                setErrPopup('Không thể kết nối sever!');
            } 
        }finally{
            setLoading(false);
        }
    };

    return (
        <section className="h-full max-w-[96%] mx-auto flex flex-col justify-center">
            <div className="">
                <div className="">
                    <Link to="/admin/category/" className="flex heading-body items-center"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="black" d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42a.996.996 0 0 0-1.41 0l-6.59 6.59a.996.996 0 0 0 0 1.41l6.59 6.59a.996.996 0 1 0 1.41-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1" /></svg>Trở về</Link>
                </div>
                <div className={`${slug ? "hidden" : "block"} heading text-black p-2`}>Thêm danh mục</div>
                <div className={`${slug ? "block" : "hidden"} heading text-black p-2`}>Cập nhật danh mục</div>
            </div>
            <form onSubmit={custom} className="border border-gray-800 bg-gray-200 p-2 rounded-md w-full lg:h-[80vh] h-[70vh] flex flex-col justify-around overflow-y-auto space-y-2">
                <div className="space-y-2">
                    <label className="heading-body">Tên danh mục</label>
                    <input type="text" name="name" value={form.name} onChange={handleOnchange} className="Digital-Login-Input" />
                </div>
                <div className="flex gap-2 items-center lg:w-[30%] space-y-2">
                    <label className="heading-body">Loại danh mục</label>
                    <select name="layout" value={form.layout} onChange={handleOnchange} className="admin-select">
                        <option value="both">Tất cả</option>
                        <option value="classic">Cổ điển</option>
                        <option value="digital">Kỹ thuật số</option>
                    </select>
                </div>
                <div className="grid grid-cols-3 grid-rows-3 gap-2">
                    <div className="heading-body row-span-1 col-span-3 border-b border-gray-600">
                        Cấu hình 3D <span className="text text-gray-500 text-xs">Lưu ý, chỉ đặt cấu hình 3D cho phân loại kỹ thuật số.</span>
                    </div>
                    <div className="row-span-1">
                        <label className="heading-body">Vị trí X</label>
                        <input type="text" name="positionX" value={threejs.positionX} disabled={isClassicLayout} onChange={threejsOnchange} className={`Digital-Login-Input ${isClassicLayout ? "opacity-50 cursor-not-allowed" : ""}`} />
                    </div>
                    <div className="row-span-1">
                        <label className="heading-body">Vị trí Y</label>
                        <input type="text" name="positionY" value={threejs.positionY} disabled={isClassicLayout} onChange={threejsOnchange} className={`Digital-Login-Input ${isClassicLayout ? "opacity-50 cursor-not-allowed" : ""}`} />
                    </div>
                    <div className="row-span-1">
                        <label className="heading-body">Vị trí Z</label>
                        <input type="text" name="positionZ" value={threejs.positionZ} disabled={isClassicLayout} onChange={threejsOnchange} className={`Digital-Login-Input ${isClassicLayout ? "opacity-50 cursor-not-allowed" : ""}`} />
                    </div>
                    <div className="row-span-2">
                        <label className="heading-body">Xoay X</label>
                        <input type="text" name="rotationX" value={threejs.rotationX} disabled={isClassicLayout} onChange={threejsOnchange} className={`Digital-Login-Input ${isClassicLayout ? "opacity-50 cursor-not-allowed" : ""}`} />
                    </div>
                    <div className="row-span-2">
                        <label className="heading-body">Xoay Y</label>
                        <input type="text" name="rotationY" value={threejs.rotationY} disabled={isClassicLayout} onChange={threejsOnchange} className={`Digital-Login-Input ${isClassicLayout ? "opacity-50 cursor-not-allowed" : ""}`} />
                    </div>
                    <div className="row-span-2">
                        <label className="heading-body">Xoay Z</label>
                        <input type="text" name="rotationZ" value={threejs.rotationZ} disabled={isClassicLayout} onChange={threejsOnchange} className={`Digital-Login-Input ${isClassicLayout ? "opacity-50 cursor-not-allowed" : ""}`} />
                    </div>
                </div>
                <div className="lg:flex gap-2 row-span-3">
                    <div className="flex-1 text lg:block hidden">
                        {err && (
                            <ErrorNoti err={err} />
                        )}
                        {succ && (
                            <SuccessNoti succ={succ} />
                        )}
                    </div>
                    <div className="flex justify-end lg:gap-2 gap-4 items-center lg:w-[30%]">
                        <div className="">
                            <button type="submit" disabled={loading} className="admin-confirm-button">Xác nhận</button>
                        </div>
                        <div className={slug ? "block" : "hidden"}>
                            <button type="button" onClick={()=>setDeleted(true)} className="admin-confirm-button px-6 bg-red-600">Xoá</button>
                        </div>
                    </div>
                    <div className="flex-1 text lg:hidden block">
                        {err && (
                            <ErrorNoti err={err} />
                        )}
                        {succ && (
                            <SuccessNoti succ={succ} />
                        )}
                    </div>
                </div>
            </form>
            {deleted && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="bg-black/60 backdrop-blur-sm absolute inset-0" />
                    <div className="bg-[#f5f5f3] flex flex-col justify-between rounded-md space-y-4 p-6 relative z-10 w-[70vw] lg:w-[20vw]">
                        <div className="flex-1">
                            <div className="heading-body">Có chắc muốn xoá?</div>
                            <div className="heading-body font-bold">{form.name}</div>
                        </div>  
                        <div className="flex gap-2 items-end justify-around w-full">
                            <div className="">
                                <button type="button" disabled={loading} className="admin-confirm-button px-6 bg-red-600" onClick={()=>{Delete(form.id)}}>Có</button>
                            </div>
                            <div className="">
                                <button type="button" disabled={loading} className="admin-confirm-button" onClick={()=>setDeleted(false)}>Không</button>
                            </div>
                        </div>
                        <div className="w-full text">
                            {errPopup && (
                                <ErrorNoti err={errPopup}/>
                            )}
                            {succPopup && (
                                <SuccessNoti succ={succPopup}/>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}