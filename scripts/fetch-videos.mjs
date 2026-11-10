#!/usr/bin/env node
/**
 * Refreshes src/content/videos.json from the Jester Folly YouTube channel.
 * Runs automatically before every build ("prebuild"), so each Vercel deploy
 * picks up new uploads. No API key needed.
 *
 * Source order:
 *   1. The channel's public RSS feed (most recent ~15 uploads).
 *   2. If the feed is unavailable (YouTube's feed endpoint returns 404 at
 *      times), the channel's /videos page, enriched from each watch page.
 *   3. If both fail, the existing videos.json is left untouched.
 *
 * Pinned video IDs listed in src/content/site.ts are always fetched too,
 * even when they are older than what the feed returns.
 *
 * This script never fails the build: every error ends in exit code 0.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CHANNEL_ID = "UCKGmm-NoaJyq9uAwZ2DSARw";
const MAX_RECENT = 15;
const TIMEOUT_MS = 10_000;

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = resolve(root, "src/content/videos.json");
const SITE_FILE = resolve(root, "src/content/site.ts");

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  // Skips the EU cookie-consent interstitial.
  Cookie: "CONSENT=YES+1; SOCS=CAI",
};

const log = (msg) => console.log(`[fetch-videos] ${msg}`);

async function get(url, init = {}) {
  const res = await fetch(url, {
    headers: HEADERS,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    ...init,
  });
  return res;
}

const decodeXml = (s = "") =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&");

const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decodeXml(m[1].trim()) : "";
};

/* ---------- Source 1: RSS ---------- */
async function fromRss() {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
  const res = await get(url);
  if (!res.ok) throw new Error(`RSS responded ${res.status}`);
  const xml = await res.text();
  const entries = xml.split("<entry>").slice(1);
  if (!entries.length) throw new Error("RSS had no entries");
  return entries.slice(0, MAX_RECENT).map((e) => {
    const published = tag(e, "published");
    return {
      id: tag(e, "yt:videoId"),
      title: tag(e, "title"),
      // Normalised so RSS and watch-page dates sort together.
      published: published ? new Date(published).toISOString() : "",
      description: tag(e, "media:description"),
    };
  });
}

/* ---------- Source 2: channel page + watch pages ---------- */
function extractJson(html, varName) {
  const re = new RegExp(`${varName}\\s*=\\s*(\\{.+?\\});\\s*(?:var |</script>)`, "s");
  const m = html.match(re);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

async function fromChannelPage() {
  const res = await get(`https://www.youtube.com/channel/${CHANNEL_ID}/videos`);
  if (!res.ok) throw new Error(`channel page responded ${res.status}`);
  const data = extractJson(await res.text(), "var ytInitialData");
  if (!data) throw new Error("channel page had no ytInitialData");

  const found = [];
  const seen = new Set();
  (function walk(node) {
    if (!node || typeof node !== "object") return;
    const lockup = node.lockupViewModel;
    if (lockup?.contentId && !seen.has(lockup.contentId)) {
      seen.add(lockup.contentId);
      found.push({
        id: lockup.contentId,
        title: lockup.metadata?.lockupMetadataViewModel?.title?.content ?? "",
      });
    }
    const legacy = node.videoRenderer ?? node.gridVideoRenderer;
    if (legacy?.videoId && !seen.has(legacy.videoId)) {
      seen.add(legacy.videoId);
      found.push({ id: legacy.videoId, title: legacy.title?.runs?.[0]?.text ?? "" });
    }
    for (const key in node) walk(node[key]);
  })(data);

  if (!found.length) throw new Error("channel page listed no videos");
  const recent = found.slice(0, MAX_RECENT);
  return mapLimit(recent, 4, async (v) => ({ ...v, ...(await fromWatchPage(v.id)) }));
}

/** Title, publish date and description for one video. Returns {} on failure. */
async function fromWatchPage(id) {
  try {
    const res = await get(`https://www.youtube.com/watch?v=${id}`);
    if (!res.ok) return {};
    const player = extractJson(await res.text(), "var ytInitialPlayerResponse");
    if (!player) return {};
    const micro = player.microformat?.playerMicroformatRenderer ?? {};
    const details = player.videoDetails ?? {};
    const published = micro.publishDate || micro.uploadDate || "";
    return clean({
      title: details.title,
      description: details.shortDescription,
      published: published ? new Date(published).toISOString() : undefined,
    });
  } catch {
    return {};
  }
}

/* ---------- Thumbnails ---------- */
async function thumbnailFor(id) {
  const hq = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const maxres = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
  try {
    const res = await get(maxres, { method: "HEAD" });
    if (res.ok) return { thumbnail: maxres, thumbnailFallback: hq };
  } catch {
    /* fall through to hq */
  }
  return { thumbnail: hq, thumbnailFallback: hq };
}

/* ---------- Helpers ---------- */
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return out;
}

const clean = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== ""));

async function readPinnedIds() {
  try {
    const src = await readFile(SITE_FILE, "utf8");
    const block = src.match(/pinnedVideoIds\s*:\s*\[([\s\S]*?)\]/);
    if (!block) return [];
    const body = block[1].replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    return [...body.matchAll(/["'`]([\w-]{11})["'`]/g)].map((m) => m[1]);
  } catch {
    return [];
  }
}

async function readExisting() {
  try {
    const json = JSON.parse(await readFile(OUT_FILE, "utf8"));
    return Array.isArray(json.videos) ? json : null;
  } catch {
    return null;
  }
}

/* ---------- Main ---------- */
async function main() {
  const existing = await readExisting();
  const previous = new Map((existing?.videos ?? []).map((v) => [v.id, v]));

  let recent = null;
  let source = null;
  for (const [name, fn] of [
    ["rss", fromRss],
    ["channel-page", fromChannelPage],
  ]) {
    try {
      recent = await fn();
      source = name;
      log(`got ${recent.length} videos from ${name}`);
      break;
    } catch (err) {
      log(`${name} unavailable: ${err.message}`);
    }
  }

  if (!recent?.length) {
    log(existing ? "keeping existing videos.json" : "no videos.json written (offline and none committed)");
    return;
  }

  // Pinned videos that the recent list doesn't include.
  const pinned = await readPinnedIds();
  const recentIds = new Set(recent.map((v) => v.id));
  const extras = await mapLimit(
    pinned.filter((id) => !recentIds.has(id)),
    4,
    async (id) => ({ id, ...(await fromWatchPage(id)) }),
  );
  if (extras.length) log(`fetched ${extras.length} pinned video(s) outside the recent list`);

  const merged = await mapLimit([...recent, ...extras], 6, async (v) => {
    const prev = previous.get(v.id) ?? {};
    const thumbs = await thumbnailFor(v.id);
    // New values win; anything we couldn't fetch this time keeps its previous value.
    return {
      id: v.id,
      title: v.title || prev.title || "Untitled",
      published: v.published || prev.published || "",
      description: v.description ?? prev.description ?? "",
      ...thumbs,
    };
  });

  merged.sort((a, b) => (b.published || "").localeCompare(a.published || ""));

  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(
    OUT_FILE,
    JSON.stringify(
      { channelId: CHANNEL_ID, source, fetchedAt: new Date().toISOString(), videos: merged },
      null,
      2,
    ) + "\n",
  );
  log(`wrote ${merged.length} videos to src/content/videos.json`);
}

main().catch((err) => {
  log(`unexpected error, keeping existing videos.json: ${err?.stack ?? err}`);
});
