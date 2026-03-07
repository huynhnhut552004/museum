import { motion } from "framer-motion";
import { textFadeUp } from "./AnimationVariants";

export default function AnimatedText({ children, className="", onClick}) {
  return (
    <motion.div variants={textFadeUp} className={`${className}`} onClick={onClick}>
      {children}
    </motion.div>
  );
}
