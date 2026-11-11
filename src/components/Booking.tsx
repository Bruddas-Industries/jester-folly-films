import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { site } from "../content/site";
import { fadeIn, frameIn, stagger } from "../lib/motion";
import { Frame, Pip, PlaceholderTag, SectionHeading } from "./ui";

declare global {
  interface Window {
    Calendly?: { initInlineWidget: (opts: { url: string; parentElement: HTMLElement }) => void };
  }
}

const CALENDLY_SCRIPT = "https://assets.calendly.com/assets/external/widget.js";

/** Calendly colour params (honoured on paid Calendly plans). */
function themedUrl(url: string) {
  const u = new URL(url);
  u.searchParams.set("background_color", "130c18");
  u.searchParams.set("text_color", "ece3d2");
  u.searchParams.set("primary_color", "f3d98b");
  u.searchParams.set("hide_gdpr_banner", "1");
  return u.toString();
}

export function Booking() {
  const reduced = useReducedMotion();
  const item = reduced ? fadeIn : frameIn;
  const { heading, intro, calendlyUrl } = site.booking;
  const email = site.contactEmail;
  const phone = site.contactPhone;

  return (
    <section id="book" aria-labelledby="book-title" className="relative scroll-mt-16 bg-velvet-deep py-28 sm:py-36">
      <div className="mx-auto grid max-w-7xl gap-y-8 px-4 sm:px-8 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-14">
        <SectionHeading id="book-title" title={heading} className="lg:col-span-10" />
        <div className="lg:col-span-4">
          <motion.div variants={stagger(0.12)} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.p variants={item} className="text-lead max-w-[36ch] text-bone/85">
              {intro}
            </motion.p>
            <motion.dl variants={item} className="text-body mt-8 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-bone/75">
              <dt>Call</dt>
              <dd>
                <a href={`tel:${phone.tel}`} className={contactLink}>
                  {phone.display}
                </a>
              </dd>
              <dt>Email</dt>
              <dd className="[overflow-wrap:anywhere]">
                <a href={`mailto:${email.address}`} className={contactLink}>
                  {email.address}
                </a>
              </dd>
            </motion.dl>
            {(phone.placeholder || email.placeholder) && (
              <motion.p variants={item} className="mt-3">
                <PlaceholderTag>
                  {phone.placeholder && email.placeholder
                    ? "Phone and email not confirmed"
                    : phone.placeholder
                      ? "Phone number not confirmed"
                      : "Email address not confirmed"}
                </PlaceholderTag>
              </motion.p>
            )}
          </motion.div>
        </div>

        <div className="mt-6 lg:col-span-8 lg:col-start-5 lg:mt-0">
          {calendlyUrl ? <CalendlyEmbed url={calendlyUrl} /> : <CalendlyPlaceholder />}
        </div>
      </div>
    </section>
  );
}

const contactLink = "text-limelight underline decoration-limelight/40 underline-offset-4 hover:decoration-limelight";

type LoadState ="idle" | "loading" | "ready" | "failed";

/** Loads Calendly's script only when the section is near the viewport. */
function CalendlyEmbed({ url }: { url: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const target = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<LoadState>("idle");

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          setState("loading");
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (state !== "loading" || !target.current) return;
    const parent = target.current;
    let done = false;
    const fail = () => !done && ((done = true), setState("failed"));

    const init = () => {
      if (!window.Calendly) return fail();
      parent.innerHTML = "";
      window.Calendly.initInlineWidget({ url: themedUrl(url), parentElement: parent });
      const iframe = parent.querySelector("iframe");
      if (!iframe) return fail();
      iframe.addEventListener("load", () => {
        done = true;
        setState("ready");
      });
    };

    const timeout = window.setTimeout(fail, 12_000);
    if (window.Calendly) init();
    else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${CALENDLY_SCRIPT}"]`);
      if (!script) {
        script = document.createElement("script");
        script.src = CALENDLY_SCRIPT;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", init, { once: true });
      script.addEventListener("error", fail, { once: true });
    }
    return () => window.clearTimeout(timeout);
  }, [state, url]);

  return (
    <div>
      <Frame>
        <div ref={frame} className="relative h-[700px] w-full">
          {/* Sits behind the embed, so the calendar covers it as soon as it paints */}
          {state !== "ready" && state !== "failed" && (
            <p className="credits absolute inset-0 flex items-center justify-center text-ash">Loading calendar…</p>
          )}
          <div ref={target} className={`relative z-10 h-full w-full ${state === "failed" ? "hidden" : ""}`} />
          {/* Calendly ships its own spinner; hide it in favour of ours */}
          <style>{`#book .calendly-spinner{display:none}`}</style>
          {state === "failed" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center">
              <Pip className="!h-8 !w-6" />
              <p className="text-lead max-w-[30ch]">The calendar didn't load here. You can book on Calendly directly.</p>
              <a href={url} target="_blank" rel="noreferrer" className="ticket">
                <span>Open the booking page</span>
              </a>
            </div>
          )}
        </div>
      </Frame>
      {state !== "failed" && (
        <p className="credits text-credit mt-4 text-ash">
          Calendar not showing?{" "}
          <a href={url} target="_blank" rel="noreferrer" className="text-bone underline underline-offset-4 hover:text-limelight">
            Open the booking page
          </a>
        </p>
      )}
    </div>
  );
}

/** Shown until a Calendly link is added to site.ts. */
function CalendlyPlaceholder() {
  const slots = ["Tue 10:00", "Tue 14:30", "Wed 11:00", "Thu 16:00", "Fri 09:30", "Fri 13:00"];
  return (
    <Frame>
      <div className="flex min-h-[560px] flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <Pip className="!h-8 !w-6" />
        <p className="font-display text-title max-w-[18ch]">Your Calendly calendar appears here</p>
        <p className="text-body max-w-[46ch] text-bone/75">
          Add the Calendly link to <code className="text-limelight">booking.calendlyUrl</code> in{" "}
          <code className="text-limelight">src/content/site.ts</code> and visitors can pick a time without leaving the page.
        </p>
        <ul aria-label="Example time slots" className="mt-2 grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-3">
          {slots.map((s) => (
            <li
              key={s}
              className="credits rounded-full border border-limelight/35 py-2.5 text-[0.9375rem] text-limelight/80"
            >
              {s}
            </li>
          ))}
        </ul>
        <PlaceholderTag>Placeholder: Calendly link not set</PlaceholderTag>
      </div>
    </Frame>
  );
}

