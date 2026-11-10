import { useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useAnchorClick } from "../lib/smooth-scroll";

const LINKS = [
  { href: "#about", label: "About", desktopOnly: true },
  { href: "#shortfalls", label: "Shortfalls", desktopOnly: false },
  { href: "#productions", label: "Productions", desktopOnly: true },
];

/**
 * Minimal over the title card; once the iris has closed it gains a velvet
 * backing and the diamond mark, which fills as you scroll down the page.
 */
export function Nav() {
  const onAnchor = useAnchorClick();
  const { scrollY, scrollYProgress } = useScroll();
  const [solid, setSolid] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setSolid(y > window.innerHeight * 0.7));
  const fillY = useTransform(scrollYProgress, [0, 1], [26, 0]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-200 ${
        solid ? "border-b border-limelight/10 bg-velvet/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        <a
          href="#top"
          onClick={onAnchor}
          className={`flex items-center gap-3 transition-opacity duration-200 ${solid ? "opacity-100" : "pointer-events-none opacity-0"}`}
          tabIndex={solid ? 0 : -1}
          aria-label="Jester Folly Films, back to top"
        >
          <svg width="18" height="26" viewBox="0 0 18 26" aria-hidden>
            <defs>
              <clipPath id="nav-fill">
                <motion.rect x="0" width="18" height="26" style={{ y: fillY }} />
              </clipPath>
            </defs>
            <path d="M9 0.8 L17.2 13 L9 25.2 L0.8 13 Z" fill="none" stroke="var(--color-limelight)" strokeWidth="1.2" />
            <path d="M9 0 L18 13 L9 26 L0 13 Z" fill="var(--color-limelight)" clipPath="url(#nav-fill)" />
          </svg>
          <span className="font-display text-[1.375rem] leading-none">Jester Folly</span>
        </a>

        <ul className="flex items-center gap-5 text-[0.9375rem] sm:gap-7">
          {LINKS.map((l) => (
            <li key={l.href} className={l.desktopOnly ? "hidden md:block" : undefined}>
              <a
                href={l.href}
                onClick={onAnchor}
                className="credits text-bone/80 underline-offset-[6px] transition-colors hover:text-limelight hover:underline"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#book" onClick={onAnchor} className="ticket ticket--ghost text-[0.9375rem]">
              <span>Book a call</span>
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
