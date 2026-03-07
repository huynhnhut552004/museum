import { motion } from "framer-motion";
import { inLeft } from "./AnimationVariants";

export default function InLeft({ children, className = "" }) {
  return (
    <motion.div
      variants={inLeft}
      className={`${className}`}
    >
      {children}
    </motion.div>
  );
}
