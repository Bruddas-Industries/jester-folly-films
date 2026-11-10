import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";

type Ctx = {
  scrollTo: (hash: string) => void;
  lock: () => void;
  unlock: () => void;
};

const SmoothScrollContext = createContext<Ctx>({ scrollTo: () => {}, lock: () => {}, unlock: () => {} });

export const NAV_OFFSET = 72;

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduced) return;
    const instance = new Lenis({ autoRaf: true, lerp: 0.11, wheelMultiplier: 0.9 });
    lenis.current = instance;
    return () => {
      instance.destroy();
      lenis.current = null;
    };
  }, [reduced]);

  const scrollTo = useCallback((hash: string) => {
    const target = hash === "#top" ? document.body : document.querySelector<HTMLElement>(hash);
    if (!target) return;
    const offset = hash === "#top" ? 0 : -NAV_OFFSET + 1;
    const focusTarget = () => {
      if (target === document.body) return;
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    };
    if (lenis.current) {
      lenis.current.scrollTo(hash === "#top" ? 0 : target, { offset, duration: 1.4, onComplete: focusTarget });
    } else {
      const y = hash === "#top" ? 0 : target.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top: y });
      focusTarget();
    }
    history.replaceState(null, "", hash === "#top" ? location.pathname : hash);
  }, []);

  const lock = useCallback(() => {
    lenis.current?.stop();
    document.documentElement.style.overflow = "hidden";
  }, []);
  const unlock = useCallback(() => {
    lenis.current?.start();
    document.documentElement.style.overflow = "";
  }, []);

  return <SmoothScrollContext.Provider value={{ scrollTo, lock, unlock }}>{children}</SmoothScrollContext.Provider>;
}

export const useSmoothScroll = () => useContext(SmoothScrollContext);

/** onClick handler for in-page anchor links. */
export function useAnchorClick() {
  const { scrollTo } = useSmoothScroll();
  return useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const href = e.currentTarget.getAttribute("href");
      if (!href?.startsWith("#")) return;
      e.preventDefault();
      scrollTo(href);
    },
    [scrollTo],
  );
}
