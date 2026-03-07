import { motion } from "framer-motion";
import { underlineScale } from "./AnimationVariants";

export default function AnimatedUnderline() {
  return (
    <motion.div
      variants={underlineScale}
    />
  );
}
