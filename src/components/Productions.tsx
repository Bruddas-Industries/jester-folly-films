import { motion, useReducedMotion } from "motion/react";
import { site, type Production } from "../content/site";
import { fadeIn, frameIn, stagger } from "../lib/motion";
import { getVideo } from "../lib/videos";
import { useVideoModal } from "./VideoModal";
import { PlaceholderTag, SectionHeading } from "./ui";

export function Productions() {
  const reduced = useReducedMotion();
  const item = reduced ? fadeIn : frameIn;

  return (
    <section id="productions" aria-labelledby="productions-title" className="relative scroll-mt-16 py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <SectionHeading
          id="productions-title"
          title="Productions"
          sub="Finished, filming, and still being argued about."
        >
          <p className="mt-6">
            <PlaceholderTag>All posters are typographic placeholders, not official artwork</PlaceholderTag>
          </p>
        </SectionHeading>
      </div>

      <motion.ul
        className="scroller mt-16 flex gap-6 overflow-x-auto pb-6 lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-5 lg:overflow-visible lg:px-8"
        variants={stagger(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      >
        {site.productions.map((p) => (
          <motion.li key={p.title} variants={item} className="w-[min(66vw,17rem)] shrink-0 lg:w-auto">
            <ProductionCard production={p} />
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}

function ProductionCard({ production: p }: { production: Production }) {
  const { openVideo } = useVideoModal();
  const poster = <Poster production={p} />;

  return (
    <figure>
      {p.videoId ? (
        <button
          type="button"
          onClick={() => openVideo(getVideo(p.videoId!))}
          aria-label={`Play ${p.title}`}
          data-cursor="play"
          className="poster-lift group block w-full text-left"
        >
          {poster}
        </button>
      ) : (
        <div className="poster-lift group">{poster}</div>
      )}
      <figcaption className="mt-5">
        <p className="font-display text-[1.375rem] leading-tight">{p.title}</p>
        <p className="credits text-credit mt-1 text-ash">
          {p.genre}, {p.year}
        </p>
        {p.logline && <p className="mt-2 text-[0.9375rem] leading-relaxed text-bone/75">{p.logline}</p>}
        <p className="mt-3">
          {p.unverified ? (
            <PlaceholderTag>Title and year unconfirmed</PlaceholderTag>
          ) : (
            p.videoId && <span className="credits text-credit text-limelight">Watch it here</span>
          )}
        </p>
      </figcaption>
    </figure>
  );
}

/* ── Posters: pure typography, drawn in CSS, sized with container units ── */

function Poster({ production: p }: { production: Production }) {
  const looks: Record<Production["poster"], { className: string; body: React.ReactNode }> = {
    stacked: { className: "bg-oxblood text-bone", body: <DevilTitle /> },
    fading: { className: "bg-[#0d0a0f] text-bone", body: <FadingTitle title={p.title} /> },
    waterline: { className: "bg-[#183129] text-bone", body: <WaterlineTitle title={p.title} /> },
    askew: { className: "bg-bone text-velvet", body: <AskewTitle title={p.title} /> },
    window: { className: "lattice text-bone", body: <WindowTitle title={p.title} /> },
  };
  const look = looks[p.poster];

  return (
    <div
      aria-hidden
      className={`relative aspect-[2/3] overflow-hidden [container-type:inline-size] ${look.className}`}
    >
      <span className="credits absolute inset-x-0 top-[6cqw] text-center text-[4.2cqw] opacity-70">
        Jester Folly Films presents
      </span>
      <div className="absolute inset-0">{look.body}</div>
      <span className="credits absolute inset-x-0 bottom-[6cqw] text-center text-[4.2cqw] opacity-70">
        {p.year}
      </span>
      {site.showPlaceholderTags && (
        <span className="credits absolute right-[-9cqw] bottom-[15cqw] rotate-[-38deg] border-y border-dashed border-current bg-limelight/90 px-[12cqw] py-[0.6cqw] text-[3.4cqw] text-velvet">
          Placeholder poster
        </span>
      )}
      <span className="pointer-events-none absolute inset-0 ring-1 ring-current/10 ring-inset transition-shadow duration-150 ease-[steps(2)] group-hover:ring-2 group-hover:ring-limelight group-focus-visible:ring-2 group-focus-visible:ring-limelight" />
    </div>
  );
}

/** Their own joke: "It looks like the Devil Don't ^Day Care." */
function DevilTitle() {
  return (
    <div className="font-display flex h-full flex-col justify-center px-[9cqw] leading-[0.86]">
      <span className="text-[12cqw] italic opacity-80">The</span>
      <span className="text-[30cqw] tracking-[-0.02em]">Devil</span>
      <span className="mt-[2cqw] text-[16.5cqw] whitespace-nowrap">
        Don’t
        <span className="relative mx-[0.04em] inline-block w-[0.5em] text-limelight">
          <span className="absolute bottom-[-0.05em] left-1/2 -translate-x-1/2 text-[0.7em] not-italic">‸</span>
          <span className="absolute bottom-[0.78em] left-1/2 -translate-x-1/2 text-[0.58em] italic">Day</span>
        </span>
        Care
      </span>
    </div>
  );
}

/** Each letter rots a little further; "Unseen" is barely there. */
function FadingTitle({ title }: { title: string }) {
  const [first, second = ""] = title.split(" ");
  const letters = [...first];
  return (
    <div className="font-display flex h-full flex-col justify-end px-[9cqw] pb-[22cqw]">
      <span className="text-[21cqw] leading-none">
        {letters.map((ch, i) => {
          const t = i / Math.max(1, letters.length - 1);
          return (
            <span key={i} style={{ opacity: 1 - t * 0.5, filter: `blur(${(t * 0.045).toFixed(3)}em)` }}>
              {ch}
            </span>
          );
        })}
      </span>
      <span className="text-[21cqw] leading-none italic opacity-[0.13]">{second}</span>
      <span className="mt-[6cqw] h-px w-[30cqw] bg-arsenic/70" />
    </div>
  );
}

/** Split at the waterline: below it the type refracts. */
function WaterlineTitle({ title }: { title: string }) {
  const [a, b = ""] = title.split(" ");
  const text = (
    <div className="font-display flex h-full flex-col items-center justify-center pt-[6cqw] text-center leading-[0.9]">
      <span className="text-[19cqw]">{a}</span>
      <span className="text-[25cqw] italic">{b}</span>
    </div>
  );
  return (
    <>
      <div className="absolute inset-x-0 top-[57%] bottom-0 bg-[#0f211c]" />
      <div className="absolute inset-0 [clip-path:inset(0_0_43%_0)]">{text}</div>
      <div className="absolute inset-0 translate-x-[2.5cqw] skew-x-[-7deg] text-[#9fd3bf] opacity-70 [clip-path:inset(57%_0_0_0)]">
        {text}
      </div>
      <div className="absolute inset-x-0 top-[57%] h-px bg-[#9fd3bf]/60" />
    </>
  );
}

/** Perfectly set, except for one letter. */
function AskewTitle({ title }: { title: string }) {
  const [a, b = ""] = title.split(" ");
  const odd = Math.max(0, b.toLowerCase().indexOf("c"));
  return (
    <div className="font-display flex h-full flex-col items-center justify-center text-center leading-[0.95]">
      <span className="text-[17cqw] italic">{a}</span>
      <span className="text-[24cqw]">
        {b.slice(0, odd)}
        <span className="inline-block translate-y-[0.06em] rotate-[13deg] text-oxblood">{b[odd]}</span>
        {b.slice(odd + 1)}
      </span>
      <span className="mt-[5cqw] h-[0.6cqw] w-[34cqw] translate-x-[1.5cqw] bg-oxblood" />
    </div>
  );
}

/** Seen through a diamond window in the motley. */
function WindowTitle({ title }: { title: string }) {
  const [a, b = ""] = title.split(" ");
  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative flex aspect-[5/7] w-[78cqw] items-center justify-center">
        <svg viewBox="0 0 50 70" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <path d="M25 0.5 L49.5 35 L25 69.5 L0.5 35 Z" fill="var(--color-velvet)" stroke="var(--color-limelight)" strokeWidth="0.35" />
        </svg>
        <div className="font-display relative text-center leading-[0.92]">
          <span className="block text-[14cqw] italic">{a}</span>
          <span className="block text-[19cqw]">{b}</span>
        </div>
      </div>
    </div>
  );
}
