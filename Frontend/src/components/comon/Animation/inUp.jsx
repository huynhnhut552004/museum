import { motion } from "framer-motion";
import { inUp } from "./AnimationVariants";

export default function InUp({ children, className = "", ...props }) {
  return (
    <motion.div variants={inUp} className={`${className}`}{...props}>
      {children}
    </motion.div>
  );
}
