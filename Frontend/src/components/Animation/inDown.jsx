import { motion } from "framer-motion";
import { inDown } from "./AnimationVariants";

export default function InDown({ children, className = "" }) {
  return (
    <motion.div
      variants={inDown}
      className={`${className}`}
    >
      {children}
    </motion.div>
  );
}
