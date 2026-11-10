import { site } from "../content/site";
import { useAnchorClick } from "../lib/smooth-scroll";
import { Pip, PlaceholderTag } from "./ui";

/** Set like end credits: role on the left, name on the right. */
export function Footer() {
  const onAnchor = useAnchorClick();
  const year = new Date().getFullYear();
  const youtube = site.social.find((s) => s.label === "YouTube");
  const others = site.social.filter((s) => s.label !== "YouTube");

  const rows: { role: string; items: { label: string; href: string; placeholder: boolean; external?: boolean }[] }[] = [
    { role: "Watch", items: youtube ? [{ ...youtube, label: "YouTube", external: true }] : [] },
    { role: "Follow", items: others.map((s) => ({ ...s, external: true })) },
    {
      role: "Write",
      items: [{ label: site.contactEmail.address, href: `mailto:${site.contactEmail.address}`, placeholder: site.contactEmail.placeholder }],
    },
    { role: "Book", items: [{ label: "A call", href: "#book", placeholder: false }] },
  ];

  return (
    <footer className="lattice relative pt-24 pb-10 sm:pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col items-center text-center">
          <Pip className="!h-9 !w-[1.6rem]" />
          <p className="font-display mt-6 text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.95]">{site.name}</p>
        </div>

        <dl className="mx-auto mt-16 grid max-w-xl grid-cols-[auto_auto_1fr] gap-x-5 sm:grid-cols-[1fr_auto_1fr] gap-y-5 sm:gap-x-10">
          {rows.map((row) => (
            <div key={row.role} className="contents">
              <dt className="credits text-credit self-baseline pt-1 text-right text-ash">{row.role}</dt>
              <span aria-hidden className="mt-[0.7rem] h-px w-6 self-start bg-limelight/40 sm:w-10" />
              <dd className="space-y-1.5">
                {row.items.map((it) => (
                  <div key={it.label} className="flex flex-wrap items-center gap-2">
                    <a
                      href={it.href}
                      onClick={it.href.startsWith("#") ? onAnchor : undefined}
                      {...(it.external ? { target: "_blank", rel: "noreferrer" } : {})}
                      className="font-display text-[1.25rem] text-bone transition-colors [overflow-wrap:anywhere] hover:text-limelight"
                    >
                      {it.label}
                    </a>
                    {it.placeholder && <PlaceholderTag />}
                  </div>
                ))}
              </dd>
            </div>
          ))}
        </dl>

        <div className="credits text-credit mt-24 flex flex-col items-center justify-between gap-4 border-t border-bone/10 pt-6 text-ash sm:flex-row">
          <p>
            © {year} {site.name}
          </p>
          <a href="#top" onClick={onAnchor} className="hover:text-limelight">
            Back to the title card
          </a>
        </div>
      </div>
    </footer>
  );
}
