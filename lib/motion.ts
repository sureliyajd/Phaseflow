import { Variants, Transition } from "framer-motion";

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Base transition configuration for calm, subtle motion
 */
export const calmTransition: Transition = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1], // ease-out
};

/**
 * Fade + slight upward movement variant
 */
export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: calmTransition,
  },
};

/**
 * Fade variant (no movement)
 */
export const fade: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: calmTransition,
  },
};

/**
 * Scale variant for subtle hover effects
 */
export const subtleScale: Variants = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
};

/**
 * Card entrance animation
 */
export const cardEntrance: Variants = {
  hidden: {
    opacity: 0,
    y: 4,
  },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      ...calmTransition,
      delay: i * 0.05, // Stagger cards slightly
    },
  }),
};

/**
 * Progress bar animation
 */
export const progressFill: Variants = {
  initial: {
    width: 0,
  },
  animate: (width: number) => ({
    width: `${width}%`,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  }),
};

/**
 * Page transition variants
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 4,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.15,
      ease: "easeIn",
    },
  },
};

/**
 * Expand/collapse animation for accordions
 */
export const expandCollapse: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: calmTransition,
  },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: calmTransition,
  },
};

