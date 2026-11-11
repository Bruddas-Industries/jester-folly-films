import { motion, useReducedMotion } from "motion/react";
import { site } from "../content/site";
import { fadeIn, frameIn, stagger } from "../lib/motion";
import { useAnchorClick } from "../lib/smooth-scroll";
import { Frame, PlaceholderTag, SectionHeading } from "./ui";

/**
 * The locations network: Jester Folly's current focus. Two viewfinders,
 * one for filmmakers looking for a place to shoot, one for businesses
 * that could host them.
 */
export function Locations() {
  const reduced = useReducedMotion();
  const item = reduced ? fadeIn : frameIn;
  const onAnchor = useAnchorClick();
  const { heading, intro, filmmakers, businesses } = site.locations;
  const email = site.contactEmail;
  const mailto = `mailto:${email.address}?subject=${encodeURIComponent(businesses.emailSubject)}`;

  return (
    <section id="locations" aria-labelledby="locations-title" className="lattice relative scroll-mt-16 py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <SectionHeading id="locations-title" title={heading} className="lg:col-span-6" />
          <motion.p
            className="text-lead max-w-[48ch] text-bone lg:col-span-5 lg:col-start-8 lg:pt-3"
            variants={item}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          >
            {intro}
          </motion.p>
        </div>

        <motion.ul
          className="mt-20 grid gap-8 sm:mt-24 md:grid-cols-2 md:gap-10"
          variants={stagger(0.16)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        >
          <motion.li variants={item} className="flex">
            <Panel title={filmmakers.title} text={filmmakers.text}>
              <a href="#book" onClick={onAnchor} className="ticket">
                <span>{filmmakers.cta}</span>
              </a>
            </Panel>
          </motion.li>
          <motion.li variants={item} className="flex">
            <Panel title={businesses.title} text={businesses.text}>
              <a href={mailto} className="ticket ticket--ghost">
                <span>{businesses.cta}</span>
              </a>
              {email.placeholder && <PlaceholderTag>Email address not confirmed</PlaceholderTag>}
            </Panel>
          </motion.li>
        </motion.ul>
      </div>
    </section>
  );
}

function Panel({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <Frame className="flex w-full flex-col bg-velvet px-7 py-10 sm:px-10 sm:py-12">
      <h3 className="font-display text-[clamp(2.25rem,4.2vw,3.25rem)] leading-[1.02]">{title}</h3>
      <p className="text-body mt-4 max-w-[42ch] flex-1 text-bone/80">{text}</p>
      <div className="mt-8 flex flex-wrap items-center gap-4">{children}</div>
    </Frame>
  );
}
