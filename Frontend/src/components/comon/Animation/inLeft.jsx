import { motion } from "framer-motion";
import { inLeft } from "./AnimationVariants";

export default function InLeft({ children, className = "", ...props }) {
  return (
    <motion.div variants={inLeft} className={`${className}`}{...props} >
      {children}
    </motion.div>
  );
}
