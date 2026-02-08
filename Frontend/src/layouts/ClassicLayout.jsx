import { Outlet } from 'react-router-dom';
import HeaderClassic from '../components/Header/HeaderClassic';
import FooterClassic from '../components/Footer/FooterClassic';
import { motion } from 'framer-motion';

export default function ClassicLayout() {
   const pageVariants = {
  initial: { opacity: 0, y: 40, backgroundColor: "#191B1D" }, 
  animate: { opacity: 1, y: 0, backgroundColor: "#E4E1D4" },
  exit: { opacity: 0, y: -40, backgroundColor: "#191B1D" }   
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
      <HeaderClassic />
      <main className="flex-1 md:pt-[150px] pt-[100px] mt-16">
        <Outlet />
      </main>
      <FooterClassic />
    </motion.div>
  );
}