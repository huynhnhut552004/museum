import { motion } from "framer-motion";
import { inDown } from "./AnimationVariants";

export default function InDown({ children, className = "", ...props }) {
  return (
    <motion.div variants={inDown} className={`${className}`}{...props}>
      {children}
    </motion.div>
  );
}
