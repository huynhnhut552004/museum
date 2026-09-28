import { motion } from "framer-motion";
import { inRight } from "./AnimationVariants";

export default function InRight({ children, className = "", ...props }) {
  return (
    <motion.div variants={inRight} className={`${className}`}{...props}>
      {children}
    </motion.div>
  );
}
