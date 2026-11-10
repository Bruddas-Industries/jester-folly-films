import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { splitTitle, type Video } from "../lib/videos";
import { IRIS_EASE } from "../lib/motion";
import { useSmoothScroll } from "../lib/smooth-scroll";

type Ctx = { openVideo: (video: Video) => void };
const VideoModalContext = createContext<Ctx>({ openVideo: () => {} });
export const useVideoModal = () => useContext(VideoModalContext);

const IRIS_CLOSED = "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)";
const IRIS_OPEN = "polygon(50% -110%, 160% 50%, 50% 210%, -60% 50%)";

export function VideoModalProvider({ children }: { children: ReactNode }) {
  const [video, setVideo] = useState<Video | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const { lock, unlock } = useSmoothScroll();

  const openVideo = useCallback(
    (v: Video) => {
      returnFocus.current = document.activeElement as HTMLElement | null;
      setVideo(v);
      lock();
    },
    [lock],
  );

  const close = useCallback(() => {
    setVideo(null);
    unlock();
  }, [unlock]);

  return (
    <VideoModalContext.Provider value={{ openVideo }}>
      {children}
      {createPortal(
        <AnimatePresence onExitComplete={() => returnFocus.current?.focus({ preventScroll: true })}>
          {video && <Modal key={video.id} video={video} onClose={close} />}
        </AnimatePresence>,
        document.body,
      )}
    </VideoModalContext.Provider>
  );
}

function Modal({ video, onClose }: { video: Video; onClose: () => void }) {
  const reduced = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { title, subtitle } = splitTitle(video.title);

  useEffect(() => {
    const root = document.getElementById("root");
    root?.setAttribute("inert", "");
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>("button, iframe, a[href]");
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      root?.removeAttribute("inert");
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const src = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-10"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-velvet-deep/95 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      />
      <motion.div
        className="relative w-full max-w-6xl"
        initial={reduced ? { opacity: 0 } : { clipPath: IRIS_CLOSED }}
        animate={reduced ? { opacity: 1 } : { clipPath: IRIS_OPEN }}
        exit={reduced ? { opacity: 0 } : { clipPath: IRIS_CLOSED }}
        transition={{ duration: reduced ? 0.15 : 0.7, ease: IRIS_EASE }}
      >
        <div className="mb-4 flex items-end justify-between gap-6">
          <div>
            <h2 id="video-modal-title" className="font-display text-[clamp(1.5rem,3vw,2.25rem)] leading-tight">
              {title}
            </h2>
            {subtitle && <p className="credits text-credit mt-1 text-ash">{subtitle}</p>}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="ticket ticket--ghost shrink-0 text-[0.9375rem]"
          >
            <span>Close</span>
          </button>
        </div>
        <div className="aspect-video w-full bg-black shadow-[0_0_120px_rgb(243_217_139/0.12)]">
          <iframe
            src={src}
            title={`${title} (YouTube video)`}
            className="h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
