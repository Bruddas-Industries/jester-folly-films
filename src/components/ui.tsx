import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { site } from "../content/site";
import { IRIS_EASE } from "../lib/motion";

/** A harlequin diamond, the site's one recurring mark. */
export function Pip({ className = "", color = "var(--color-limelight)" }: { className?: string; color?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 10 14" className={`inline-block h-[0.9em] w-[0.64em] shrink-0 ${className}`}>
      <path d="M5 0 L10 7 L5 14 L0 7 Z" fill={color} />
    </svg>
  );
}

/** Flags prototype copy that hasn't been confirmed. Toggle with site.showPlaceholderTags. */
export function PlaceholderTag({ children = "Placeholder", className = "" }: { children?: ReactNode; className?: string }) {
  if (!site.showPlaceholderTags) return null;
  return (
    <span
      className={`credits inline-flex items-center rounded-sm border border-dashed border-limelight/45 px-1.5 py-px align-middle text-[0.6875rem] leading-snug text-limelight/90 ${className}`}
    >
      {children}
    </span>
  );
}

/** A viewfinder: limelight corner marks around a block (the booking embed, the locations panels). */
export function Frame({ children, className = "bg-velvet p-3 sm:p-5" }: { children: ReactNode; className?: string }) {
  const corner = "absolute h-6 w-6 border-limelight";
  return (
    <div className={`relative ${className}`}>
      <span aria-hidden className={`${corner} top-0 left-0 border-t border-l`} />
      <span aria-hidden className={`${corner} top-0 right-0 border-t border-r`} />
      <span aria-hidden className={`${corner} bottom-0 left-0 border-b border-l`} />
      <span aria-hidden className={`${corner} right-0 bottom-0 border-r border-b`} />
      {children}
    </div>
  );
}

const IRIS_CLOSED = "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)";
const IRIS_OPEN = "polygon(50% -150%, 150% 50%, 50% 250%, -50% 50%)";

/** Section titles open through the same diamond iris as the hero. */
export function SectionHeading({
  id,
  title,
  sub,
  className = "",
  children,
}: {
  id: string;
  title: string;
  sub?: string;
  className?: string;
  children?: ReactNode;
}) {
  const reduced = useReducedMotion();
  return (
    <div className={className}>
      <motion.h2
        id={id}
        className="font-display text-[clamp(3rem,8.5vw,6.5rem)] leading-[0.92] tracking-[-0.01em] text-balance"
        initial={reduced ? false : { clipPath: IRIS_CLOSED }}
        whileInView={{ clipPath: IRIS_OPEN }}
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
        transition={{ duration: 1.1, ease: IRIS_EASE }}
      >
        {title}
      </motion.h2>
      {sub && <p className="font-display text-lead mt-4 text-ash italic">{sub}</p>}
      {children}
    </div>
  );
}
