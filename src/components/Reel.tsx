import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { site } from "../content/site";
import { excerpt, formatDate, getReel, splitTitle, type Video } from "../lib/videos";
import { fadeIn, frameIn, stagger } from "../lib/motion";
import { useVideoModal } from "./VideoModal";
import { SectionHeading } from "./ui";

const CHANNEL_URL = site.social.find((s) => s.label === "YouTube")?.href ?? "https://www.youtube.com";

export function Reel() {
  const reduced = useReducedMotion();
  const item = reduced ? fadeIn : frameIn;
  const [featured, ...rest] = getReel();
  const scroller = useRef<HTMLUListElement>(null);

  const page = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: reduced ? "auto" : "smooth" });
  };

  if (!featured) return null;

  return (
    <section id="shortfalls" aria-labelledby="reel-title" className="relative scroll-mt-16 bg-velvet-deep py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading id="reel-title" title={site.reel.heading} sub={site.reel.subheading} />
          <a
            href={CHANNEL_URL}
            target="_blank"
            rel="noreferrer"
            className="credits text-bone/80 underline decoration-limelight/40 underline-offset-[6px] transition-colors hover:text-limelight"
          >
            Every video on YouTube
          </a>
        </div>

        <Featured video={featured} />
      </div>

      {rest.length > 0 && (
        <div className="mt-24">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
            <h3 className="font-display text-title">More from the channel</h3>
            <div className="hidden gap-2 sm:flex">
              <ScrollButton label="Scroll videos left" onClick={() => page(-1)} flip />
              <ScrollButton label="Scroll videos right" onClick={() => page(1)} />
            </div>
          </div>
          <motion.ul
            ref={scroller}
            className="scroller mt-8 flex gap-6 overflow-x-auto pb-6"
            variants={stagger(0.07)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          >
            {rest.map((v) => (
              <motion.li key={v.id} variants={item} className="w-[min(78vw,22rem)] shrink-0">
                <VideoCard video={v} />
              </motion.li>
            ))}
          </motion.ul>
        </div>
      )}
    </section>
  );
}

function Featured({ video }: { video: Video }) {
  const { openVideo } = useVideoModal();
  const { title, subtitle } = splitTitle(video.title);
  const blurb = excerpt(video.description, 240);

  return (
    <div className="mt-16 grid items-end gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-8">
        <Facade video={video} size="large" onPlay={() => openVideo(video)} label={`Play ${title}`} eager />
      </div>
      <div className="lg:col-span-4 lg:pb-2">
        {subtitle && <p className="credits text-credit text-limelight">{subtitle}</p>}
        <h3 className="font-display mt-2 text-[clamp(2rem,3.6vw,3rem)] leading-[1.02] text-balance">{title}</h3>
        {video.published && (
          <p className="credits text-credit mt-3 text-ash">
            Released <time dateTime={video.published}>{formatDate(video.published)}</time>
          </p>
        )}
        {blurb && <p className="text-body mt-5 max-w-[42ch] text-bone/80">{blurb}</p>}
        <div className="mt-7 flex flex-wrap items-center gap-5">
          <button type="button" className="ticket" onClick={() => openVideo(video)}>
            <span>
              <PlayGlyph /> Watch the film
            </span>
          </button>
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noreferrer"
            className="credits text-bone/75 underline decoration-bone/30 underline-offset-[6px] hover:text-limelight"
          >
            Open on YouTube
          </a>
        </div>
      </div>
    </div>
  );
}

function VideoCard({ video }: { video: Video }) {
  const { openVideo } = useVideoModal();
  const { title } = splitTitle(video.title);
  return (
    <div>
      <Facade video={video} onPlay={() => openVideo(video)} label={`Play ${title}`} />
      <h4 className="font-display mt-4 text-[1.375rem] leading-snug">{title}</h4>
      {video.published && (
        <p className="credits text-credit mt-1 text-ash">
          <time dateTime={video.published}>{formatDate(video.published)}</time>
        </p>
      )}
    </div>
  );
}

/**
 * Lightweight player facade: a thumbnail and a play button. The YouTube
 * iframe only loads when the modal opens.
 */
function Facade({
  video,
  onPlay,
  label,
  size = "card",
  eager = false,
}: {
  video: Video;
  onPlay: () => void;
  label: string;
  size?: "card" | "large";
  eager?: boolean;
}) {
  const [src, setSrc] = useState(video.thumbnail);
  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={label}
      data-cursor="play"
      className="group relative block aspect-video w-full overflow-hidden bg-velvet-raised"
    >
      <img
        src={src}
        onError={() => src !== video.thumbnailFallback && setSrc(video.thumbnailFallback)}
        alt=""
        width={1280}
        height={720}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="frame-advance absolute inset-0 h-full w-full object-cover"
      />
      {/* Velvet wash keeps mismatched thumbnails in one palette until hovered */}
      <span aria-hidden className="frame-wash absolute inset-0 bg-velvet mix-blend-multiply" />
      <span
        aria-hidden
        className="absolute inset-0 ring-1 ring-bone/10 transition-shadow duration-150 ease-[steps(2)] ring-inset group-hover:ring-2 group-hover:ring-limelight group-focus-visible:ring-2 group-focus-visible:ring-limelight"
      />
      <span
        aria-hidden
        className={`absolute bottom-0 left-0 flex items-center justify-center bg-limelight text-velvet transition-transform duration-150 ease-[steps(2)] group-hover:-translate-y-1 ${
          size === "large" ? "h-16 w-16 sm:h-20 sm:w-20" : "h-12 w-12"
        }`}
      >
        <PlayGlyph className={size === "large" ? "h-6 w-6" : "h-4 w-4"} />
      </span>
    </button>
  );
}

function PlayGlyph({ className = "h-[0.85em] w-[0.85em]" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 12 14" className={className}>
      <path d="M1 0.8 L11 7 L1 13.2 Z" fill="currentColor" />
    </svg>
  );
}

function ScrollButton({ label, onClick, flip = false }: { label: string; onClick: () => void; flip?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-bone/25 text-bone transition-colors hover:border-limelight hover:text-limelight"
    >
      <svg aria-hidden viewBox="0 0 16 16" className={`h-4 w-4 ${flip ? "rotate-180" : ""}`}>
        <path d="M5 2 L11 8 L5 14" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </button>
  );
}
