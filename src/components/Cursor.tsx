import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

type Mode = "hidden" | "default" | "link" | "play";

/**
 * A small diamond that trails the pointer and becomes a "Play" card over
 * videos. Desktop pointers only; off for reduced motion and touch.
 */
export function Cursor() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>("hidden");
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 700, damping: 45, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 700, damping: 45, mass: 0.4 });

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(mq.matches && !reduced);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [reduced]);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as Element | null;
      if (!t || t.tagName === "IFRAME") return setMode("hidden");
      if (t.closest("[data-cursor='play']")) return setMode("play");
      if (t.closest("a, button, [role='button'], summary, label")) return setMode("link");
      setMode("default");
    };
    const leave = () => setMode("hidden");
    // Iframes swallow pointer events, so hide on the way in rather than waiting for a move.
    const out = (e: PointerEvent) => {
      const next = e.relatedTarget as Element | null;
      if (!next || next.tagName === "IFRAME") setMode("hidden");
    };
    // Clicking a video opens the modal under a stationary pointer; drop the "Play" state.
    const click = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest("[data-cursor='play']")) setMode("hidden");
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerout", out);
    document.addEventListener("click", click);
    document.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerout", out);
      document.removeEventListener("click", click);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const size = mode === "play" ? 76 : mode === "link" ? 22 : 12;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[100]"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className="relative -translate-x-1/2 -translate-y-1/2"
        animate={{ width: size, height: size * 1.4, opacity: mode === "hidden" ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
      >
        <svg viewBox="0 0 10 14" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          <path
            d="M5 0 L10 7 L5 14 L0 7 Z"
            fill={mode === "play" ? "var(--color-limelight)" : "transparent"}
            stroke="var(--color-limelight)"
            strokeWidth={mode === "play" ? 0 : 1}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <AnimatePresence>
          {mode === "play" && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12, ease: "linear" }}
              className="credits absolute inset-0 flex items-center justify-center text-[0.8125rem] text-velvet"
            >
              Play
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
