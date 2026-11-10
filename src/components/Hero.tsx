import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { site } from "../content/site";
import { IRIS_EASE } from "../lib/motion";
import { useAnchorClick } from "../lib/smooth-scroll";

/** Harlequin diamonds are taller than wide. */
const RHOMBUS = 1.4;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Phase = "dark" | "lamp" | "open" | "settled";

/**
 * The title card. On load a projector lamp flickers at the centre, then a
 * harlequin-diamond iris opens on the wordmark. Scrolling closes the iris
 * back down to that same point of light, which hands off to the page.
 */
export function Hero() {
  const reduced = useReducedMotion() ?? false;
  const onAnchor = useAnchorClick();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>(reduced ? "settled" : "dark");

  // Stage size, kept in motion values so the iris recalculates without re-renders.
  const w = useMotionValue(1280);
  const h = useMotionValue(800);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      w.set(entry.contentRect.width);
      h.set(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h]);

  // Opening sequence: wait for the display font, flicker the lamp, open the iris.
  const load = useMotionValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) {
      load.set(1);
      setPhase("settled");
      return;
    }
    let cancelled = false;
    let controls: ReturnType<typeof animate> | undefined;
    (async () => {
      // The lamp flickers while the display font finishes loading (capped).
      setPhase("lamp");
      await Promise.all([Promise.race([document.fonts?.ready, wait(900)]), wait(650)]);
      if (cancelled) return;
      setPhase("open");
      controls = animate(load, 1, { duration: 1.45, ease: IRIS_EASE });
      // Bring in the tagline once the iris is most of the way open.
      await wait(1000);
      if (!cancelled) setPhase("settled");
    })();
    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [reduced, load]);

  // Scrolling through the hero closes the iris.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const scrollOpen = useTransform(scrollYProgress, [0.06, 0.8], [1, 0], { clamp: true });
  const p = useTransform(() => (reduced ? 1 : Math.min(load.get(), scrollOpen.get())));

  const radius = useTransform(() => p.get() * (w.get() / 2 + h.get() / (2 * RHOMBUS)) * 1.04);
  const clipPath = useTransform(() => {
    if (p.get() >= 0.999) return "none";
    const [cx, cy, r] = [w.get() / 2, h.get() / 2, radius.get()];
    return `polygon(${cx}px ${cy - RHOMBUS * r}px, ${cx + r}px ${cy}px, ${cx}px ${cy + RHOMBUS * r}px, ${cx - r}px ${cy}px)`;
  });
  const outline = useTransform(() => {
    const [cx, cy, r] = [w.get() / 2, h.get() / 2, radius.get()];
    return `${cx},${cy - RHOMBUS * r} ${cx + r},${cy} ${cx},${cy + RHOMBUS * r} ${cx - r},${cy}`;
  });
  const outlineOpacity = useTransform(p, [0, 0.03, 0.9, 1], [0, 0.7, 0.35, 0]);
  const pipOpacity = useTransform(p, [0, 0.025, 0.05], [1, 1, 0]);

  // Inside the iris: a slow dolly-in on the title as it closes. With reduced
  // motion the hero is one static viewport, so none of this scroll-linking applies.
  const titleScale = useTransform(() => (reduced ? 1 : 1 + 0.18 * Math.min(1, scrollYProgress.get() / 0.8)));
  const restOpacity = useTransform(() => (reduced ? 1 : Math.max(0, 1 - scrollYProgress.get() / 0.18)));
  const handoff = useTransform(scrollYProgress, [0.72, 1], [0, 1]);

  const [line1, line2] = site.wordmark;
  const showTitle = phase === "open" || phase === "settled";

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-labelledby="hero-title"
      className={reduced ? "relative h-svh" : "relative h-[175svh]"}
    >
      <div ref={stageRef} className="lattice sticky top-0 h-svh overflow-hidden">
        {/* The projected title card, seen through the iris */}
        <motion.div className="beam absolute inset-0" style={{ clipPath }}>
          <div className={`flex h-full flex-col items-center justify-center px-4 ${reduced ? "" : "gate-weave"}`}>
            <motion.h1
              id="hero-title"
              style={{ scale: titleScale }}
              className="font-display relative select-none text-center leading-[0.82] tracking-[-0.01em]"
              initial={false}
              animate={
                showTitle && !reduced
                  ? { opacity: [0.15, 1, 0.45, 1, 0.75, 1], filter: ["blur(8px)", "blur(5px)", "blur(3px)", "blur(1px)", "blur(0px)", "blur(0px)"] }
                  : { opacity: showTitle ? 1 : 0 }
              }
              transition={{ duration: 1.1, times: [0, 0.15, 0.3, 0.5, 0.7, 1], ease: "linear" }}
            >
              <span className="sr-only">{site.name}</span>
              <span aria-hidden className="block text-[clamp(4.25rem,27vw,15rem)]">
                {line1}
              </span>
              <span aria-hidden className="relative block pl-[0.55em] text-[clamp(4.25rem,27vw,15rem)]">
                <FallingF letter={line2[0]} armed={phase === "settled"} reduced={reduced} />
                {line2.slice(1)}
                {/* Tucked under "ll", clear of the y's descender; sized off the wordmark */}
                <span className="text-limelight absolute top-[3.55em] right-[2.5em] text-[0.2em] leading-none italic">
                  Films
                </span>
              </span>
            </motion.h1>

            <motion.div style={{ opacity: restOpacity }} className="mt-12">
              <motion.div
                initial={false}
                animate={{ opacity: phase === "settled" ? 1 : 0 }}
                transition={{ duration: reduced ? 0 : 0.35, ease: "linear" }}
                className="flex flex-col items-center gap-7 text-center"
              >
                <p className="text-lead max-w-[30ch] text-balance text-bone/85">{site.tagline}</p>
                <a href="#book" onClick={onAnchor} className="ticket" tabIndex={phase === "settled" ? 0 : -1}>
                  <span>Book a call</span>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Iris edge, drawn in projector light */}
        {!reduced && (
          <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
            <motion.polygon
              points={outline}
              fill="none"
              stroke="var(--color-limelight)"
              strokeWidth={1}
              style={{ opacity: outlineOpacity }}
            />
          </svg>
        )}

        {/* The lamp: a point of light the iris opens from and closes back into */}
        {!reduced && <Pip opacity={pipOpacity} flicker={phase === "lamp"} hidden={phase === "dark"} />}

        {!reduced && phase === "settled" && (
          <motion.p
            aria-hidden
            style={{ opacity: restOpacity }}
            className="credits text-credit absolute inset-x-0 bottom-6 text-center text-ash"
          >
            Scroll
          </motion.p>
        )}

        {/* Dissolve the lattice into the page as the hero scrolls away */}
        {!reduced && (
          <motion.div
            aria-hidden
            style={{ opacity: handoff }}
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-velvet"
          />
        )}
      </div>
    </section>
  );
}

function Pip({ opacity, flicker, hidden }: { opacity: MotionValue<number>; flicker: boolean; hidden: boolean }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ opacity: hidden ? 0 : opacity }}
    >
      <motion.svg
        width="18"
        height="26"
        viewBox="0 0 18 26"
        animate={flicker ? { opacity: [0, 1, 0.3, 1, 0.1, 0.9, 1] } : { opacity: 1 }}
        transition={{ duration: 0.7, ease: "linear", times: [0, 0.12, 0.25, 0.45, 0.6, 0.8, 1] }}
        style={{ filter: "drop-shadow(0 0 10px rgb(243 217 139 / 0.8))" }}
      >
        <path d="M9 0 L18 13 L9 26 L0 13 Z" fill="var(--color-limelight)" />
      </motion.svg>
    </motion.div>
  );
}

/** The F hangs crooked off one nail for a beat, then drops into place. */
function FallingF({ letter, armed, reduced }: { letter: string; armed: boolean; reduced: boolean }) {
  const [dropped, setDropped] = useState(reduced);
  useEffect(() => {
    if (!armed || reduced) return;
    const t = setTimeout(() => setDropped(true), 380);
    return () => clearTimeout(t);
  }, [armed, reduced]);

  return (
    <motion.span
      className="inline-block"
      style={{ transformOrigin: "18% 10%" }}
      initial={false}
      animate={{ rotate: dropped ? 0 : 17, y: dropped ? 0 : "0.04em" }}
      transition={dropped ? { type: "spring", stiffness: 320, damping: 7, mass: 0.9 } : { duration: 0 }}
    >
      {letter}
    </motion.span>
  );
}
