import { motion } from "framer-motion";
import { textFadeUp } from "./AnimationVariants";

export default function AnimatedText({ children, className = "", onClick, ref, key }) {
  return (
    <motion.div ref={ref} key={key} variants={textFadeUp} className={`${className}`} onClick={onClick}>
      {children}
    </motion.div>
  );
}
