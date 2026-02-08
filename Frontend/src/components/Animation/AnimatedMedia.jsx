import { motion } from "framer-motion";
import { mediaLeft, mediaRight } from "./AnimationVariants";

export default function AnimatedMedia({ direction = "right", children }) {
  return (
    <motion.div
      variants={direction === "left" ? mediaLeft : mediaRight}
    >
      {children}
    </motion.div>
  );
}
