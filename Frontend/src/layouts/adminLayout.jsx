import { Outlet } from 'react-router-dom';
import Nav from '../components/admin/navbar/Navigation';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { io } from 'socket.io-client';

export default function AdminLayout() {
    const [mobie, setMobile] = useState(false);

    useEffect(() => {
        const socket = io('http://localhost:5000');
        socket.on('ai-alert', (data) => {
            if (data.status === 'success') {
                toast.success(data.message);
                return;
            }
            if (data.status === 'error') {
                let message = data.message || 'Có lỗi xảy ra khi xử lý AI.';
                if (data.title) message = `${data.title}: ${message}`;
                if (data.attempts && data.maxAttempts) message += ` (Lần thử ${data.attempts}/${data.maxAttempts})`;
                if (data.code === 'ROLLBACK_ERROR') {
                    toast.error(
                        `⚠️ ${message}`,
                        {
                            autoClose: false
                        }
                    );
                } else {
                    toast.error(message);
                }
            }
        });
        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const handleResize = () => { setMobile(window.innerWidth < 1024); };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className={`flex ${mobie ? "flex-col" : "flex-row"} bg-[#f5f5f3] min-h-screen`}>
            <Nav />
            <main className="flex-1">
                <Outlet />
            </main>
            <ToastContainer
                position="top-right"
                autoClose={4000}
                theme="colored"
            />
        </div>
    );
}