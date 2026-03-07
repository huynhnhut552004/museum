import { easeInOut } from "framer-motion";

export const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

export const titleFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export const textFadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export const underlineScale = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.5, ease: "easeInOut" }
  }
};

export const mediaLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const mediaRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const section = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.1
    }
  }
};


export const inUp={
  hidden: {opacity: 0, y: 30},
  visible:{
    opacity: 1,
    y: 0,
    transition: {duration: 0.6, ease: "easeOut"}
  }
};

export const inDown={
  hidden: {opacity: 0, y: -30},
  visible:{
    opacity: 1,
    y: 0,
    transition: {duration: 0.6, ease: "easeInOut"}
  }
};

export const inLeft={
  hidden: {opacity: 0, x: -30},
  visible:{
    opacity: 1,
    x: 0,
    transition: {duration: 0.6, ease: "easeInOut"}
  }
};

export const inRight={
  hidden: {opacity: 0, x: 30},
  visible:{
    opacity: 1,
    x: 0,
    transition: {duration: 0.6, ease: "easeInOut"}
  }
};

