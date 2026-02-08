import { motion } from "framer-motion";
import { section } from "./AnimationVariants";

export default function Section({ children }) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true ,amount: 0.8 }}
      variants={section}
    >
      {children}
    </motion.section>
  );
}
 