import ErrorNoti from "../../comon/Noti/Error";
import SuccessNoti from "../../comon/Noti/Success";
import userApi from "../../../api/userApi";
import { Link } from 'react-router-dom';
import { useState } from "react";

export default function AddUserLayout() {
    const [err, setErr] = useState('');
    const [succ, setSucc] = useState('');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "user", ban: false });

    const handleOnchange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === "ban" ? value === "true" : value
        }));
        if(err) setErr('');
        if(succ) setSucc('');
    };

    const create = async (e) => {
        e.preventDefault();
        if (!form.email || !form.name || !form.password) {
            setErr("Vui lòng nhập đủ dữ liệu!");
            return;
        }
        setLoading(true);
        setErr('');
        setSucc('');
        try {
            await userApi.createUser(form.email, form.password, form.name, form.role, form.ban);
            setForm({ name: "", email: "", password: "", role: "user", ban: false });
            setSucc('Tạo tài khoản thành công!');
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                const mess = error.response.data.message;
                if (status === 409) {
                    setErr('Email này đã được sử dụng!');
                } else if (status === 400 && mess.includes("Không đúng định dạng.")) {
                    setErr('Email không đúng định dạng!');
                } else if (status === 400 && mess.includes("Mật khẩu yếu.")) {
                    setErr('Mật khẩu yếu!')
                }
            } else if (error.request) {
                setErr('Lỗi hệ thống, vui lòng thử lại sau!');
            } else {
                setErr('Không thể kết nối server!');
            }
        }finally{
            setLoading(false);
        }
    };

    return (
        <section className="h-full max-w-[96%] mx-auto flex flex-col justify-center">
            <div className="">
                <div className="">
                    <Link to="/admin/user/" className="flex heading-body items-center"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="black" d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42a.996.996 0 0 0-1.41 0l-6.59 6.59a.996.996 0 0 0 0 1.41l6.59 6.59a.996.996 0 1 0 1.41-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1" /></svg>Trở về</Link>
                </div>
                <div className="heading text-black p-2">Thêm người dùng</div>
            </div>
            <form onSubmit={create} className="border border-gray-800 bg-gray-200 p-2 rounded-md w-full lg:h-[80vh] h-[70vh] flex flex-col justify-around">
                <div className="">
                    <label className="heading-body">Tên</label>
                    <input type="text" name="name" value={form.name} onChange={handleOnchange} className="Digital-Login-Input" />
                </div>
                <div className="">
                    <label className="heading-body">Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleOnchange} className="Digital-Login-Input" />
                </div>
                <div className="">
                    <label className="heading-body">Mật khẩu</label>
                    <input type="text" name="password" value={form.password} onChange={handleOnchange} className="Digital-Login-Input" />
                </div>
                <div className="justify-between lg:justify-normal flex">
                    <div className="flex gap-2 items-center w-[30%]">
                        <label className="heading-body">Quyền</label>
                        <select name="role" value={form.role} onChange={handleOnchange} className="admin-select">
                            <option value="user">Người dùng</option>
                            <option value="admin">Quản trị</option>
                        </select>
                    </div>
                    <div className="flex gap-2 items-center">
                        <label className="heading-body">Ban</label>
                        <select name="ban" value={form.ban.toString()} onChange={handleOnchange} className="admin-select">
                            <option value="false">Hoạt động</option>
                            <option value="true">Vô hiệu hoá</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex-1 text">
                        {err && (
                            <ErrorNoti err={err} />
                        )}
                        {succ && (
                            <SuccessNoti succ={succ} />
                        )}
                    </div>
                    <div className="text-right w-[30%]">
                        <button type="submit" disabled={loading} className="admin-confirm-button">Xác nhận</button>
                    </div>
                </div>
            </form>
        </section>
    )
}