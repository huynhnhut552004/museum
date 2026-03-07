import { motion } from "framer-motion";
import { titleFadeUp } from "./AnimationVariants";

export default function AnimatedTitle({ children, className = "" }) {
  return (
    <motion.div
      variants={titleFadeUp}
      className={`${className}`}
    >
      {children}
    </motion.div>
  );
}
