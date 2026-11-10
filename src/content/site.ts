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
  /** Real videos from the channel that show this kind of work. */
  examples: string[];
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

  // PLACEHOLDER: tagline written for the prototype.
  tagline: "Short films made with a straight face and a crooked grin.",

  about: {
    // PLACEHOLDER: intro copy written for the prototype.
    heading: "Small films about bad ideas",
    intro:
      "Jester Folly is an independent production company making short films that start as jokes and end up somewhere stranger: a day care with a demon problem, a sonnet read at a graveside, a girl quietly rotting at the dinner table while her parents fail to notice.",
    secondary:
      "We write, shoot and cut everything ourselves, so a small budget still gets a finished film. Comedy, horror, music videos, and anything that sits awkwardly between them.",
    placeholder: true,
  },

  // PLACEHOLDER: service names and descriptions. The examples are real channel videos.
  services: [
    {
      name: "Short films",
      description:
        "Horror, comedy and the space in between, from first draft to festival cut.",
      examples: ["Rotting Unseen", "The Devil Don't Day Care", "Stuck in Your Head"],
    },
    {
      name: "Comedy sketches",
      description: "Quick, character-driven bits built to be watched twice and sent to a friend.",
      examples: ["My First Time", "That One Time in Class", "Bored Forever"],
    },
    {
      name: "Music videos",
      description: "Performance, lyric and narrative videos for bands and solo artists.",
      examples: ["Car Radio fan video", "4 Cords lyric video", "Diamonds cover"],
    },
    {
      name: "Branded & commissioned work",
      description: "Commercials and promo pieces for schools, events and small businesses.",
      examples: ["Year Book Commercial"],
    },
  ] satisfies Service[],

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
    heading: "Book a call",
    // PLACEHOLDER: booking copy.
    intro:
      "Have a script, a song or a strange idea? Pick a time and we'll talk it through. Calls are free and take about 30 minutes.",
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
