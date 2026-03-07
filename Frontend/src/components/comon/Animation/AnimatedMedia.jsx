import { motion } from "framer-motion";
import { mediaLeft, mediaRight } from "./AnimationVariants";

export default function AnimatedMedia({ direction = "right", children, className="" }) {
  return (
    <motion.div
      variants={direction === "left" ? mediaLeft : mediaRight} className={`${className}`}
    >
      {children}
    </motion.div>
  );
}
