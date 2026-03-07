import { Outlet } from 'react-router-dom';
import Nav from '../components/admin/navbar/navigation';
import { useState, useEffect } from 'react';

export default function AdminLayout() {
  const [mobie, setMobile] = useState(false);

    useEffect(()=>{
        const handleResize = () => {
            setMobile(window.innerWidth < 1024);
        };
         handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    },[]);
  return (
    <div className={`flex ${mobie ? "flex-col" : "flex-row"} bg-[#f5f5f3] min-h-screen`}>
      <Nav/>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}