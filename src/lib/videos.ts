import data from "../content/videos.json";
import { site } from "../content/site";

export type Video = {
  id: string;
  title: string;
  published: string;
  description: string;
  thumbnail: string;
  thumbnailFallback: string;
};

const all = data.videos as Video[];
const byId = new Map(all.map((v) => [v.id, v]));

/** A pinned ID that has no data yet (e.g. fetched offline) still gets a card. */
const stub = (id: string): Video => ({
  id,
  title: "Untitled video",
  published: "",
  description: "",
  thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  thumbnailFallback: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
});

/** Pinned videos first (in site.ts order), then the newest uploads. */
export function getReel(): Video[] {
  const hidden = new Set<string>(site.hiddenVideoIds);
  const pinned = site.pinnedVideoIds.filter((id) => !hidden.has(id)).map((id) => byId.get(id) ?? stub(id));
  const pinnedIds = new Set(pinned.map((v) => v.id));
  const rest = all.filter((v) => !pinnedIds.has(v.id) && !hidden.has(v.id));
  return [...pinned, ...rest].slice(0, site.reelLimit);
}

export function getVideo(id: string): Video {
  return byId.get(id) ?? stub(id);
}

/** "The Devil Don't Day Care | Short Horror Comedy 2026" → title + subtitle */
export function splitTitle(raw: string) {
  const [title, ...rest] = raw.split(/\s+[|\-–]\s+/);
  return { title: title.trim(), subtitle: rest.join(" ").trim() };
}

export function formatDate(iso: string) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(iso));
}

/** First paragraph of a description, trimmed at a word boundary. */
export function excerpt(text: string, max = 220) {
  const first = text.split(/\n\s*\n/)[0]?.replace(/\s+/g, " ").trim() ?? "";
  if (first.length <= max) return first;
  return first.slice(0, first.lastIndexOf(" ", max)).replace(/[,;:.\s]+$/, "") + "…";
}
