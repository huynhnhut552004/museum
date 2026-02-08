import { motion } from "framer-motion";
import { inUp } from "./AnimationVariants";

export default function InUp({ children, className = "" }) {
  return (
    <motion.div
      variants={inUp}
      className={`${className}`}
    >
      {children}
    </motion.div>
  );
}
