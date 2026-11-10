# Jester Folly Films

A one-page preview site for Jester Folly Films, an independent production company making darkly comic short films. It's a look-and-feel prototype: real videos from the YouTube channel, with placeholder copy clearly tagged.

**Stack:** Vite, React, TypeScript, Tailwind CSS 4, Motion, Lenis. Deploys as a static site on Vercel. No environment variables.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # refreshes the reel, then builds to dist/
npm run preview    # serve the production build locally
```

---

## Editing the site

All copy lives in **`src/content/site.ts`**. You shouldn't need to touch any component to change text, links or videos.

| Field | What it controls |
|---|---|
| `tagline` | The line under the title card |
| `about` | About heading, intro and second paragraph |
| `services` | The four "what we make" items, each with real example titles |
| `reel` | Section name ("Shortfalls") and its subtitle |
| `pinnedVideoIds` | Videos that always show first (see below) |
| `hiddenVideoIds` | Videos to leave out of the reel |
| `reelLimit` | How many videos the reel shows |
| `productions` | Poster row: title, year, genre, logline, poster style, optional video |
| `booking.calendlyUrl` | Your Calendly event link |
| `contactEmail`, `social` | Footer and booking contact links |
| `showPlaceholderTags` | Set to `false` to hide every "Placeholder" tag at once |

Anything marked `PLACEHOLDER` in that file was written for the prototype and hasn't been confirmed. When you replace it, also set its `placeholder` / `unverified` flag to `false` so its on-page tag disappears.

### Pinning videos

The reel shows pinned videos first, then the channel's newest uploads.

```ts
pinnedVideoIds: [
  "BZFHyuBdQdQ", // The Devil Don't Day Care  ← the first one is the big featured video
  "1SWM7BPxfPc", // Rotting Unseen
],
```

The ID is the part after `v=` in a YouTube link: `youtube.com/watch?v=`**`BZFHyuBdQdQ`**.

Pinning is how you feature older favourites. YouTube's feed only lists the ~15 most recent uploads, but the build looks up any pinned ID that isn't in that list. To feature a different film, put its ID first.

To drop a video from the reel (a vlog, an old test), add its ID to `hiddenVideoIds`.

### Booking (Calendly)

Paste your Calendly event link into `booking.calendlyUrl`, e.g. `"https://calendly.com/jesterfolly/30min"`. Until then, the section shows a styled placeholder.

- The Calendly script loads only when a visitor scrolls near the booking section.
- If Calendly fails to load within 12 seconds, visitors see a button to open the booking page directly. A plain link to it is always shown under the calendar as well.
- The site passes its colours to Calendly. Calendly only applies custom colours on paid plans; on the free plan the calendar shows in Calendly's default white.

---

## How the reel refreshes itself

`scripts/fetch-videos.mjs` runs automatically before every build (it's the `prebuild` npm script), so **each Vercel deploy picks up new uploads**. It needs no API key.

1. It reads the channel's public RSS feed.
2. If YouTube's feed is down (it intermittently returns 404), it reads the channel's /videos page instead.
3. It fetches any pinned videos that aren't in the recent list.
4. It writes `src/content/videos.json` with each video's id, title, date, description and thumbnail. It uses the full-resolution `maxresdefault.jpg` when YouTube has one, and falls back to `hqdefault.jpg`.

If both sources fail, the script leaves the existing `videos.json` alone and **never fails the build**. A copy of `videos.json` is committed, so the site also works offline.

To refresh by hand: `npm run fetch:videos`, then commit the updated `videos.json`.

**Refreshing without a code change:** in Vercel, go to *Project → Settings → Git → Deploy Hooks* and create a hook. Calling that URL (by hand, or on a schedule with any cron service) rebuilds the site and pulls in new uploads.

The channel-page fallback reads YouTube's page structure, which YouTube can change without notice. If it ever breaks, the RSS path and the committed `videos.json` still work.

---

## Deploying on Vercel

1. Import the GitHub repo in Vercel.
2. Vercel detects Vite. Keep the defaults: build command `npm run build`, output directory `dist`.
3. No environment variables are needed.

Each branch gets its own preview URL. Experimental design variations go on `design/*` branches (e.g. `design/alt-hero`), so each can be reviewed side by side without touching `main`.

---

## Design notes

**Direction: "The Fool's Iris."** The page is a title sequence projected in an old theatre after hours.

- **Palette:** Velvet `#1B1121` (base), Bone `#ECE3D2` (text), Oxblood `#8E1F2B` and Arsenic `#4F8A6E` (the harlequin pair), Limelight `#F3D98B` (projector light only), Ash `#9C90A0` (secondary text). Tokens are defined in `src/index.css`.
- **Type:** IM Fell English for display (self-hosted in `public/fonts` and preloaded); Archivo variable for body text and condensed "credits".
- **Motion:** stepped 24fps-style flicker and frame-advance entrances instead of smooth fades. The signature moment is the harlequin-diamond iris: it opens the title card, closes on scroll, and returns on every section title and the video modal.
- **Reduced motion:** with `prefers-reduced-motion`, the page drops smooth scrolling, the iris, grain movement, flicker and the custom cursor, and shows a static title card.

### Fonts

IM Fell English and Archivo are licensed under the SIL Open Font License.
