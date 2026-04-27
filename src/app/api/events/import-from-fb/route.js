// Server-side Facebook event importer.
//
// Pulls Open Graph meta tags + JSON-LD Event schema from a public Facebook
// event URL, returning a normalized payload the create-event form can consume.
// Image bytes are downloaded server-side and returned as a data URL so the
// client can drop them straight into the existing image-upload flow.
//
// Limitations:
//  - Only works for public events. Facebook returns a login redirect for
//    private events — we surface that as a 422 with a friendly message.
//  - Date extraction depends on FB still emitting JSON-LD with startDate.
//    If they stop, the rest of the import still works; date stays empty.

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Two UAs we cycle through. FB serves slightly different responses to each:
//  - The Chrome desktop UA gets the standard public event page.
//  - facebookexternalhit/1.1 is FB's own crawler UA, used by their own
//    link-preview system. Several FB endpoints (notably the plugin embed)
//    will return rich preview HTML to this UA without requiring login.
const USER_AGENT_DESKTOP =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const USER_AGENT_FB_CRAWLER =
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";
const USER_AGENT = USER_AGENT_DESKTOP;

const decodeHtml = (str) =>
  String(str || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");

const findMeta = (html, propertyOrName) => {
  const escaped = propertyOrName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regexes = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']*)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${escaped}["']`,
      "i"
    ),
  ];
  for (const re of regexes) {
    const m = html.match(re);
    if (m) return decodeHtml(m[1]);
  }
  return null;
};

const findJsonLd = (html) => {
  const re =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      out.push(JSON.parse(m[1].trim()));
    } catch {
      // Some FB pages embed slightly invalid JSON-LD; ignore those blocks.
    }
  }
  return out;
};

const findEventNode = (json) => {
  if (!json) return null;
  if (Array.isArray(json)) {
    for (const item of json) {
      const found = findEventNode(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof json === "object") {
    const t = json["@type"];
    const isEvent =
      (typeof t === "string" && t.toLowerCase().includes("event")) ||
      (Array.isArray(t) &&
        t.some((x) => typeof x === "string" && x.toLowerCase().includes("event")));
    if (isEvent) return json;
    if (json["@graph"]) {
      const found = findEventNode(json["@graph"]);
      if (found) return found;
    }
    for (const v of Object.values(json)) {
      if (v && typeof v === "object") {
        const found = findEventNode(v);
        if (found) return found;
      }
    }
  }
  return null;
};

// Convert an ISO timestamp into the "YYYY-MM-DDTHH:mm" string expected by
// <input type="datetime-local"> — using the local server time interpretation
// of the ISO string. The FB JSON-LD start_time is always in ISO with offset,
// so this correctly preserves the wall-clock time the host advertised.
const toDateTimeLocalValue = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

// Strip tracking junk from a pasted FB event URL and produce one or more
// (url, ua, referer) candidate tuples to try. FB returns 400 / login walls
// for unauth fetches in lots of cases, so we cycle through several
// hostnames + crawler UAs until one returns real event HTML.
//
// Order matters — most-likely-to-succeed first:
//   1. mbasic.facebook.com — the "basic" mobile site, lightweight HTML, friendliest to scrapers.
//   2. plugins/event.php — FB's public embed widget, designed to be loaded from third-party sites.
//   3. m.facebook.com — mobile site, sometimes serves preview without login.
//   4. www.facebook.com — desktop, often gates behind login but worth a final try with crawler UA.
const buildCandidates = (rawUrl) => {
  const out = [];
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return out;
  }

  const idMatch = parsed.pathname.match(/\/events\/[^/]*?(\d{6,})/);
  const eventId = idMatch ? idMatch[1] : null;

  if (eventId) {
    const canonical = `https://www.facebook.com/events/${eventId}/`;
    const pluginUrl = `https://www.facebook.com/plugins/event.php?href=${encodeURIComponent(
      canonical
    )}&show_text=true&width=500`;

    out.push({ url: `https://mbasic.facebook.com/events/${eventId}`, ua: USER_AGENT_DESKTOP });
    out.push({ url: pluginUrl, ua: USER_AGENT_DESKTOP, referer: "https://example.com/" });
    out.push({ url: pluginUrl, ua: USER_AGENT_FB_CRAWLER, referer: "https://example.com/" });
    out.push({ url: `https://m.facebook.com/events/${eventId}`, ua: USER_AGENT_DESKTOP });
    out.push({ url: canonical, ua: USER_AGENT_FB_CRAWLER });
    out.push({ url: canonical, ua: USER_AGENT_DESKTOP });
  }

  // Last resort — original URL with query params stripped.
  const stripped = `${parsed.origin}${parsed.pathname}`;
  if (!out.some((c) => c.url === stripped)) {
    out.push({ url: stripped, ua: USER_AGENT_DESKTOP });
  }

  return out;
};

// True if the HTML body looks like FB's "Log into Facebook to continue"
// gate rather than a real event page. We use this to skip 200-OK responses
// that wouldn't yield useful data anyway.
const looksLikeLoginWall = (html) => {
  if (!html) return true;
  const lower = html.toLowerCase();
  if (lower.includes("you must log in to continue")) return true;
  if (lower.includes("log into facebook to continue")) return true;
  if (lower.includes('id="email"') && lower.includes('id="pass"')) return true;
  // No og:title at all is a strong signal there's no event content here.
  if (!/property=["']og:title["']/i.test(html)) return true;
  return false;
};

const fetchEventHtml = async (candidates) => {
  let lastStatus = null;
  let lastFailure = null;
  for (const c of candidates) {
    try {
      const headers = {
        "User-Agent": c.ua,
        "Accept-Language": "en-US,en;q=0.9",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      };
      if (c.referer) headers.Referer = c.referer;
      const res = await fetch(c.url, { headers, redirect: "follow" });
      lastStatus = res.status;
      if (!res.ok) {
        lastFailure = `status ${res.status}`;
        continue;
      }
      const text = await res.text();
      if (looksLikeLoginWall(text)) {
        lastFailure = "login wall";
        continue;
      }
      return { html: text, status: res.status, finalUrl: c.url };
    } catch (e) {
      lastFailure = e?.message || "network error";
    }
  }
  return { html: null, status: lastStatus, finalUrl: null, lastFailure };
};

const fetchAsDataUrl = async (url) => {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 8 * 1024 * 1024) return null; // 8 MB safety cap
    return `data:${contentType};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
};

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ message: "Missing URL." }), {
        status: 400,
      });
    }

    if (!/^https?:\/\//i.test(url)) {
      return new Response(
        JSON.stringify({ message: "URL must start with http:// or https://" }),
        { status: 400 }
      );
    }

    if (!/(?:facebook\.com|fb\.me|fb\.com)/i.test(url)) {
      return new Response(
        JSON.stringify({
          message: "Please paste a Facebook event URL.",
        }),
        { status: 400 }
      );
    }

    const candidates = buildCandidates(url);
    if (candidates.length === 0) {
      return new Response(
        JSON.stringify({ message: "Could not parse that URL." }),
        { status: 400 }
      );
    }

    const {
      html,
      status: lastStatus,
      finalUrl,
      lastFailure,
    } = await fetchEventHtml(candidates);

    if (!html) {
      const reason =
        lastFailure === "login wall"
          ? "Facebook is requiring login to view this event. That usually means it's private, or visible only to certain audiences. Public events normally import without issue."
          : lastStatus === 404
            ? "Facebook returned 404 — the event URL may be wrong or the event was deleted."
            : `Facebook blocked the import (${lastFailure || `status ${lastStatus}`}). The event may be private, restricted to certain regions, or temporarily rate-limiting our server. You can paste the title/date/description manually below.`;
      return new Response(JSON.stringify({ message: reason }), { status: 502 });
    }

    const ogTitle = findMeta(html, "og:title");
    const ogDesc = findMeta(html, "og:description");
    const ogImage = findMeta(html, "og:image");
    // Prefer the og:url FB itself emits (always the canonical form), then the
    // candidate URL that succeeded, then whatever the user pasted as a last
    // resort. This means facebook_link gets saved without all the tracking
    // junk on it.
    const ogUrl = findMeta(html, "og:url") || finalUrl || url;

    let startIso = null;
    let endIso = null;
    let jsonName = null;
    let jsonDesc = null;
    let jsonImage = null;
    let jsonLocation = null;

    for (const node of findJsonLd(html)) {
      const ev = findEventNode(node);
      if (ev) {
        startIso = ev.startDate || ev.start_time || null;
        endIso = ev.endDate || null;
        jsonName = ev.name || jsonName;
        jsonDesc = ev.description || jsonDesc;
        if (typeof ev.image === "string") jsonImage = ev.image;
        else if (Array.isArray(ev.image)) jsonImage = ev.image[0];
        else if (ev.image && ev.image.url) jsonImage = ev.image.url;
        if (ev.location) {
          if (typeof ev.location === "string") jsonLocation = ev.location;
          else if (ev.location.name) jsonLocation = ev.location.name;
          else if (
            ev.location.address &&
            typeof ev.location.address === "string"
          )
            jsonLocation = ev.location.address;
        }
        break;
      }
    }

    const name = jsonName || ogTitle || null;
    const description = jsonDesc || ogDesc || null;
    const imageUrl = jsonImage || ogImage || null;
    const date = toDateTimeLocalValue(startIso);

    let durationHours = null;
    if (startIso && endIso) {
      const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
      if (ms > 0) durationHours = +(ms / 3600000).toFixed(2);
    }

    const imageDataUrl = imageUrl ? await fetchAsDataUrl(imageUrl) : null;

    // Use a trimmed first chunk of the description for the front-page summary.
    // Form schema caps shortdescription at 400 chars.
    const shortdescription = description
      ? description.length > 280
        ? description.slice(0, 277).trim() + "…"
        : description
      : null;

    const haveAnything = !!(name || description || date || imageUrl);
    if (!haveAnything) {
      return new Response(
        JSON.stringify({
          message:
            "Couldn't read this Facebook event automatically — it may be private or behind a login. You can still fill the form in manually.",
        }),
        { status: 422 }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        extracted: {
          name,
          shortdescription,
          description,
          date,
          duration: durationHours ? String(durationHours) : null,
          location: jsonLocation,
          facebook_link: ogUrl,
          image: imageDataUrl
            ? {
                dataUrl: imageDataUrl,
                suggestedName: "fb-event-cover.jpg",
              }
            : null,
          image_remote_url: imageUrl,
        },
        warnings: {
          missing_date: !date,
          missing_description: !description,
          missing_image: !imageUrl,
          image_download_failed: !!imageUrl && !imageDataUrl,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: `Import failed: ${error?.message || "unknown error"}`,
      }),
      { status: 500 }
    );
  }
}
