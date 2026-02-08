import { motion } from "framer-motion";
import { sectionVariants } from "./AnimationVariants";
import { useMediaQuery } from "react-responsive";

export default function AnimatedSection({ children }) {
  const isDesktop = useMediaQuery({ minWidth: 768 });

  return (
    <motion.section
      initial="hidden"
      {...(isDesktop
        ? { whileInView: "visible", viewport: { once: true, amount: 0 } }
        : { animate: "visible" })}
      variants={sectionVariants}
    >
      {children}
    </motion.section>
  );
}
