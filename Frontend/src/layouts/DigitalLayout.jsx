import { Outlet } from 'react-router-dom';
import HeaderDigi from '../components/digital/Header';
import FooterDigi from '../components/digital/Footer';
import { motion } from "framer-motion";
import { useLocation } from 'react-router-dom';

export default function DigitalLayout() {
  const location= useLocation();
  const isExplore= location.pathname==="/digital/explore";
  const pageVariants = {
  initial: { opacity: 0, y: 40, backgroundColor: "#E4E1D4" }, 
  animate: { opacity: 1, y: 0, backgroundColor: "#191B1D" },
  exit: { opacity: 0, y: -40, backgroundColor: "#E4E1D4" }   
};
  return (
    <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{duration:0.5, ease: "easeInOut"}}
    className="flex flex-col min-h-screen font-sans 
    ">
      <HeaderDigi/>
      <main className={`flex-1 ${isExplore ? "pt-[70px]" : "pt-[100px]"}`}>
        <Outlet />
      </main>
      <FooterDigi/>
    </motion.div>
  );
}