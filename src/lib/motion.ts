import type { Variants } from "motion/react";

export const IRIS_EASE = [0.7, 0, 0.2, 1] as const;

/**
 * "Frame advance": an entrance that arrives in discrete frames with a
 * projector flicker, instead of a smooth fade-and-slide.
 */
export const frameIn: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: [0, 0.85, 0.2, 0.95, 1],
    y: [14, 14, 6, 6, 0],
    transition: { duration: 0.42, times: [0, 0.18, 0.4, 0.62, 1], ease: "linear" },
  },
};

/** Reduced-motion version: a plain, quick fade. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
};

export const stagger = (delay = 0.12): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: delay } },
});
