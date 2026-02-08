import { motion } from "framer-motion";
import { textFadeUp } from "./AnimationVariants";

export default function AnimatedText({ children }) {
  return (
    <motion.div variants={textFadeUp}>
      {children}
    </motion.div>
  );
}
