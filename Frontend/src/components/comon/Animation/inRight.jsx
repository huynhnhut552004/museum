import { motion } from "framer-motion";
import { inRight } from "./AnimationVariants";

export default function InRight({ children, className = "" }) {
  return (
    <motion.div
      variants={inRight}
      className={`${className}`}
    >
      {children}
    </motion.div>
  );
}
