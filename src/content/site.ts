/**
 * ─────────────────────────────────────────────────────────────────────────
 *  Jester Folly Films: site content
 *  Every piece of editable copy on the site lives in this file.
 *
 *  Anything marked  PLACEHOLDER  was written for the prototype and has not
 *  been confirmed with Jester Folly. Replace it, then flip the matching
 *  `placeholder` flag to false (or delete the comment).
 * ─────────────────────────────────────────────────────────────────────────
 */

export type Service = {
  name: string;
  description: string;
  /** Optional: real videos from the channel that show this kind of work. */
  examples?: string[];
};

export type PosterStyle = "stacked" | "fading" | "waterline" | "askew" | "window";

export type Production = {
  title: string;
  year: number;
  /** Short genre line shown on the poster. */
  genre: string;
  /** Typographic poster treatment (see Productions.tsx). */
  poster: PosterStyle;
  /** One-line logline shown under the poster. */
  logline?: string;
  /** If set, the poster opens this YouTube video. */
  videoId?: string;
  /** true = title/year not yet confirmed with the owner. */
  unverified: boolean;
};

export type SocialLink = {
  label: string;
  href: string;
  placeholder: boolean;
};

export const site = {
  name: "Jester Folly Films",
  /** The two lines of the hero title card. */
  wordmark: ["Jester", "Folly"] as const,

  /** The line under the title card. */
  tagline: "Making a movie? Tell us what you're missing and we'll help you find it.",

  about: {
    heading: "Let's get your movie made",
    intro:
      "We love making movies, and we'd love to help you make yours. Tell us what you don't have yet, whether that's a crew, a place to shoot or someone to talk it through with, and we'll help you find it.",
    secondary:
      "Mostly, we connect filmmakers with talented crew. Right now we're also building a network of local businesses where indie and student productions can film for less.",
    placeholder: false,
  },

  /** "How we help" list under the About intro. */
  services: [
    {
      name: "Crew",
      description:
        "We connect filmmakers with talented crew for the roles you can't cover yourself: camera, sound, lighting, editing and more.",
    },
    {
      name: "Locations",
      description:
        "A growing network of local businesses that let independent and student productions film on location at a low cost.",
    },
    {
      name: "Our own films",
      description:
        "We write, shoot and cut our own short films, and bring what we've learned to yours.",
      examples: ["Rotting Unseen", "The Devil Don't Day Care", "Stuck in Your Head"],
    },
  ] satisfies Service[],

  /** The locations network: one call to action for filmmakers, one for businesses. */
  locations: {
    heading: "Film on location for less",
    intro:
      "Locations are our big focus right now. We're building a network of businesses that let indie and student filmmakers shoot on their premises at a low cost.",
    filmmakers: {
      title: "Need a location?",
      text: "Tell us what your script calls for and we'll look for a match in the network.",
      cta: "Book a free consultation",
    },
    businesses: {
      title: "Have a space?",
      text: "Open your business to student and indie productions. Tell us when it's free and we'll introduce you to filmmakers who need it.",
      cta: "Add your business",
      /** Subject line for the email the button starts. */
      emailSubject: "Adding my business to the locations network",
    },
  },

  reel: {
    heading: "Shortfalls",
    subheading: "Short films, and the occasional fall.",
  },

  /**
   * Videos that always appear first in the reel, in this order.
   * The FIRST ID is the large featured video.
   *
   * Paste the 11-character ID from a YouTube link:
   *   https://www.youtube.com/watch?v=BZFHyuBdQdQ  →  "BZFHyuBdQdQ"
   *
   * Older videos work too: the build fetches any pinned ID that isn't in
   * the channel's recent uploads.
   */
  pinnedVideoIds: [
    "BZFHyuBdQdQ", // The Devil Don't Day Care (featured)
    "1SWM7BPxfPc", // Rotting Unseen
  ],

  /** Videos to leave out of the reel (vlogs, old uploads, etc.). */
  hiddenVideoIds: [
    "bvNQkufIErU", // The Jumbled Mess of my Heart (Vlog)
  ] as string[],

  /** How many videos to show in the reel (featured + scroller). */
  reelLimit: 13,

  productions: [
    {
      title: "The Devil Don't Day Care",
      year: 2026,
      genre: "Horror comedy",
      logline: "Four employees are trapped inside a children's day care by something demonic.",
      poster: "stacked",
      videoId: "BZFHyuBdQdQ",
      unverified: false, // Confirmed: on the YouTube channel
    },
    {
      // PLACEHOLDER: title/year unverified
      title: "Cunning Folk",
      year: 2026,
      genre: "In development",
      poster: "window",
      unverified: true,
    },
    {
      // PLACEHOLDER: title/year unverified
      title: "Almost Perfect",
      year: 2025,
      genre: "Comedy",
      poster: "askew",
      unverified: true,
    },
    {
      title: "Rotting Unseen",
      year: 2024,
      genre: "Short horror",
      logline: "Tori is rotting to death at dinner with her parents, who don't notice.",
      poster: "fading",
      videoId: "1SWM7BPxfPc",
      unverified: false, // Confirmed: on the YouTube channel
    },
    {
      // PLACEHOLDER: title/year unverified
      title: "Swimming Naked",
      year: 2024,
      genre: "Drama",
      poster: "waterline",
      unverified: true,
    },
  ] satisfies Production[],

  booking: {
    heading: "Book a free consultation",
    intro:
      "Call or book a free consultation with the movie men. Tell us about your movie and what you don't have yet, and let's see how we can help.",
    /**
     * PLACEHOLDER: replace with the real Calendly event link, e.g.
     *   "https://calendly.com/jesterfolly/30min"
     * While this is empty the section shows a styled placeholder instead of the embed.
     */
    calendlyUrl: "",
  },

  contactEmail: {
    // PLACEHOLDER: not a confirmed address.
    address: "hello@jesterfollyfilms.com",
    placeholder: true,
  },

  contactPhone: {
    // PLACEHOLDER: a fictional 555 number. Replace with the real one.
    display: "(555) 555-0142",
    /** Digits for the tel: link, with country code. */
    tel: "+15555550142",
    placeholder: true,
  },

  social: [
    { label: "YouTube", href: "https://www.youtube.com/@JesterFolly", placeholder: false },
    // PLACEHOLDER: handles not confirmed.
    { label: "Instagram", href: "https://www.instagram.com/", placeholder: true },
    { label: "TikTok", href: "https://www.tiktok.com/", placeholder: true },
  ] satisfies SocialLink[],

  /** Shows small "Placeholder" tags on unconfirmed content. Set false for launch. */
  showPlaceholderTags: true,
} as const;

export type Site = typeof site;
