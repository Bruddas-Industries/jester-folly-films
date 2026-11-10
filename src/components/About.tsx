import { motion, useReducedMotion } from "motion/react";
import { site } from "../content/site";
import { fadeIn, frameIn, stagger } from "../lib/motion";
import { Pip, PlaceholderTag, SectionHeading } from "./ui";

const SUITS = ["var(--color-oxblood)", "var(--color-arsenic)"];

export function About() {
  const reduced = useReducedMotion();
  const item = reduced ? fadeIn : frameIn;

  return (
    <section id="about" aria-labelledby="about-title" className="relative scroll-mt-16 py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <SectionHeading id="about-title" title={site.about.heading} className="lg:col-span-6" />

          <motion.div
            className="max-w-[60ch] lg:col-span-5 lg:col-start-8 lg:pt-3"
            variants={stagger(0.14)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          >
            <motion.p variants={item} className="text-lead text-bone">
              {site.about.intro}
            </motion.p>
            <motion.p variants={item} className="text-body mt-6 text-bone/75">
              {site.about.secondary}
            </motion.p>
            {site.about.placeholder && (
              <motion.div variants={item} className="mt-5">
                <PlaceholderTag>Placeholder copy</PlaceholderTag>
              </motion.div>
            )}
          </motion.div>
        </div>

        <h3 className="sr-only">What we make</h3>
        <motion.ul
          className="mt-24 grid gap-x-16 gap-y-14 sm:mt-32 md:grid-cols-2"
          variants={stagger(0.16)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        >
          {site.services.map((s, i) => (
            <motion.li key={s.name} variants={item} className="border-t border-bone/15 pt-7">
              <h4 className="font-display flex items-baseline gap-4 text-[clamp(1.875rem,3.4vw,2.5rem)] leading-tight">
                <Pip color={SUITS[i % 2]} className="!h-[1.75rem] !w-[1.25rem]" />
                {s.name}
              </h4>
              <p className="text-body mt-3 max-w-[46ch] text-bone/80 sm:pl-[2.25rem]">{s.description}</p>
              <p className="credits text-credit mt-4 text-ash sm:pl-[2.25rem]">
                Seen in {s.examples.join(", ")}
              </p>
            </motion.li>
          ))}
        </motion.ul>
        <p className="mt-10">
          <PlaceholderTag>Service list is a placeholder; examples are real videos</PlaceholderTag>
        </p>
      </div>
    </section>
  );
}
