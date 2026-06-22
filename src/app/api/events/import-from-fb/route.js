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
import { authOptions } from "@/lib/authOptions";

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

// Pull the numeric event id out of any FB event URL form.
const parseEventId = (rawUrl) => {
  try {
    const parsed = new URL(rawUrl);
    const m = parsed.pathname.match(/\/events\/[^/]*?(\d{6,})/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
};

// Find an event id anywhere in a string (URL-decoded). Handles canonical
// /events/<id>/ paths, ids buried in ?next= login redirects, and the long
// (15–16 digit) ids FB uses, as a fallback.
const extractEventIdFromString = (s) => {
  if (!s) return null;
  let decoded = s;
  try {
    decoded = decodeURIComponent(s);
  } catch {
    // keep raw if it isn't valid percent-encoding
  }
  let m = decoded.match(/events\/(\d{6,})/);
  if (m) return m[1];
  m = decoded.match(/(\d{12,})/);
  return m ? m[1] : null;
};

// Resolve a pasted URL to a numeric event id. Short links (fb.me/e/…) and
// /share/… links carry no id in the path, so we follow the redirect chain and
// read the id out of each hop's Location header (and, as a last resort, the
// final page body). Runs from our server, but resolving a redirect is a light
// request FB usually still answers even when full page scraping is blocked.
const resolveEventId = async (rawUrl) => {
  const direct = parseEventId(rawUrl);
  if (direct) return direct;

  // Short links (fb.me/e/…, /share/…) carry no id in the path. Follow the
  // redirect chain and read the id out of the FINAL url. We use redirect:
  // "follow" (not "manual") because Node's server-side fetch returns an opaque,
  // header-less response for manual redirects — res.url would be empty. With
  // "follow", res.url is the resolved URL (e.g. /events/<id>/…), which is all
  // we need, regardless of the final status code.
  try {
    const res = await fetch(rawUrl, {
      redirect: "follow",
      headers: {
        "User-Agent": USER_AGENT_DESKTOP,
        "Accept-Language": "en-US,en;q=0.9",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const fromUrl = extractEventIdFromString(res.url);
    if (fromUrl) return fromUrl;

    // Last resort: scan the landing page body for a canonical event id.
    try {
      const text = await res.text();
      const m =
        text.match(/\/events\/(\d{6,})/) ||
        text.match(/"eventID"\s*:\s*"(\d{6,})"/i);
      if (m) return m[1];
    } catch {
      // ignore body read errors
    }
  } catch {
    // network error — fall through to null
  }
  return null;
};

// Strip tracking junk from a pasted FB event URL and produce one or more
// (url, ua, referer) candidate tuples to try. FB returns 400 / login walls
// for unauth fetches in lots of cases, so we cycle through several
// hostnames + crawler UAs until one returns real event HTML.
//
// Order matters — most-likely-to-succeed first:
//   1. www.facebook.com with the facebookexternalhit UA — FB serves OG link-
//      preview meta to its own crawler UA, our best shot at title/desc/image.
//   2. plugins/event.php — FB's public embed widget, built for third-party sites.
//   3. m.facebook.com — mobile site, sometimes serves preview without login.
//   4. www.facebook.com desktop — usually gated, but a worthwhile final try.
//
// NOTE: mbasic.facebook.com was permanently retired by Facebook on 2024-12-03,
// so it has been removed from the rotation (it only ever returned errors now).
const buildCandidates = (rawUrl, knownEventId = null) => {
  const out = [];
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return out;
  }

  const eventId = knownEventId || parseEventId(rawUrl);

  if (eventId) {
    const canonical = `https://www.facebook.com/events/${eventId}/`;
    const pluginUrl = `https://www.facebook.com/plugins/event.php?href=${encodeURIComponent(
      canonical
    )}&show_text=true&width=500`;

    out.push({ url: canonical, ua: USER_AGENT_FB_CRAWLER });
    out.push({ url: pluginUrl, ua: USER_AGENT_FB_CRAWLER, referer: "https://example.com/" });
    out.push({ url: pluginUrl, ua: USER_AGENT_DESKTOP, referer: "https://example.com/" });
    out.push({ url: `https://m.facebook.com/events/${eventId}`, ua: USER_AGENT_DESKTOP });
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

// ── Graph API path (free — uses the page tokens we already hold for posting) ─
// If the event is owned OR co-hosted by our Mama / White Lotus page, the
// page's token can read it through the official Graph API. That returns clean
// structured data — crucially the real start_time/end_time and the cover photo,
// the two fields HTML scraping almost never recovers.
//
// We try each page token in turn. ANY failure (event not ours, missing
// permission, expired token, Meta's Marketing-Partner gate) just returns null,
// and the caller falls through to HTML scraping. So this can only ever help —
// it never makes the import worse.
// v22.0 confirmed live (2026-06-22); v18.0 nears end-of-life. Fields used here
// (name/description/start_time/end_time/place/cover/ticket_uri) are unchanged.
const GRAPH_VERSION = "v22.0";

const fetchViaGraphApi = async (eventId) => {
  if (!eventId) return null;
  const tokens = [
    process.env.FACEBOOK_WHITELOTUS_PAGE_TOKEN,
    process.env.FACEBOOK_MAMA_PAGE_TOKEN,
  ].filter(Boolean);
  if (tokens.length === 0) return null;

  const fields =
    "id,name,description,start_time,end_time,place,cover,ticket_uri,is_page_owned";

  for (const token of tokens) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/${GRAPH_VERSION}/${eventId}?fields=${fields}&access_token=${encodeURIComponent(
          token
        )}`,
        { redirect: "follow" }
      );
      if (!res.ok) continue;
      const data = await res.json();
      // FB returns 200 with an { error } body for permission/ownership issues.
      if (!data || data.error || !data.name) continue;

      let location = null;
      if (data.place) {
        if (typeof data.place === "string") location = data.place;
        else if (data.place.name) location = data.place.name;
        else if (data.place.location) {
          location =
            [data.place.location.street, data.place.location.city]
              .filter(Boolean)
              .join(", ") || null;
        }
      }

      return {
        name: data.name || null,
        description: data.description || null,
        startIso: data.start_time || null,
        endIso: data.end_time || null,
        location,
        imageUrl: data.cover?.source || null,
        facebook_link: `https://www.facebook.com/events/${eventId}/`,
        ticket_uri: data.ticket_uri || null,
      };
    } catch {
      // try the next token, then fall through to scraping
    }
  }
  return null;
};

// Last-ditch date recovery for the scrape path: modern FB event pages often
// omit JSON-LD but still embed the start time in inline JSON. Look for a unix
// timestamp first, then an ISO string.
const findInlineStartTime = (html) => {
  if (!html) return null;
  let m = html.match(/"start_timestamp"\s*:\s*(\d{9,13})/);
  if (m) {
    let n = parseInt(m[1], 10);
    if (m[1].length <= 10) n *= 1000; // seconds → ms
    const d = new Date(n);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  m = html.match(/"start_time"\s*:\s*"([^"]+)"/);
  if (m) {
    const d = new Date(m[1].replace(/([+-]\d{2})(\d{2})$/, "$1:$2"));
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return null;
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

    // Resolve short links (fb.me/e/…, /share/…) to a numeric event id.
    const eventId = await resolveEventId(url);

    // Facebook refuses server-side requests to its short-link hosts (fb.me),
    // so we can't expand them. If we couldn't get an id and the URL looks like
    // a short/share link, tell the user exactly how to get a usable URL rather
    // than failing with a generic "blocked" message.
    if (!eventId && /fb\.me|\/share\/|\/events\/s\//i.test(url)) {
      return new Response(
        JSON.stringify({
          message:
            "That's a Facebook short link, which Facebook won't let our server open. Click the link to open the event in your browser, then copy the full web address from the address bar — it looks like facebook.com/events/1234567890/ — and paste that here instead.",
        }),
        { status: 422 },
      );
    }

    // Shared output — populated by whichever source wins (Graph API or scrape).
    let name = null;
    let description = null;
    let startIso = null;
    let endIso = null;
    let jsonLocation = null;
    let imageUrl = null;
    let ogUrl = url;
    let ticketUri = null;
    let source = null;

    // ── 1) Graph API first — free, structured, recovers date + cover image ──
    // Works whenever the event is owned or co-hosted by a page we hold a token
    // for. Returns null on any failure so we fall through to scraping.
    const graph = await fetchViaGraphApi(eventId);
    if (graph) {
      name = graph.name;
      description = graph.description;
      startIso = graph.startIso;
      endIso = graph.endIso;
      jsonLocation = graph.location;
      imageUrl = graph.imageUrl;
      ogUrl = graph.facebook_link || url;
      ticketUri = graph.ticket_uri;
      source = "graph";
    }

    // ── 2) HTML scrape fallback (OG tags + JSON-LD + inline JSON) ───────────
    if (!source) {
      const candidates = buildCandidates(url, eventId);
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
              : `Facebook blocked the automatic import (${lastFailure || `status ${lastStatus}`}). Facebook blocks automated requests from servers, so this can happen for events our pages don't host. Please fill in the details manually below.`;
        return new Response(JSON.stringify({ message: reason }), {
          status: 502,
        });
      }

      const ogTitle = findMeta(html, "og:title");
      const ogDesc = findMeta(html, "og:description");
      const ogImage = findMeta(html, "og:image");
      // Prefer the og:url FB itself emits (always canonical), then the
      // candidate URL that succeeded, then whatever the user pasted. Keeps
      // facebook_link clean of tracking junk.
      ogUrl = findMeta(html, "og:url") || finalUrl || url;

      let jsonName = null;
      let jsonDesc = null;
      let jsonImage = null;

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

      // FB increasingly omits JSON-LD entirely; try to recover the date from
      // inline JSON before giving up on it.
      if (!startIso) startIso = findInlineStartTime(html);

      name = jsonName || ogTitle || null;
      description = jsonDesc || ogDesc || null;
      imageUrl = jsonImage || ogImage || null;
      source = "scrape";
    }

    const date = toDateTimeLocalValue(startIso);

    let durationHours = null;
    if (startIso && endIso) {
      const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
      if (ms > 0) durationHours = +(ms / 3600000).toFixed(2);
    }

    const imageDataUrl = imageUrl ? await fetchAsDataUrl(imageUrl) : null;

    // Trimmed first chunk of the description for the front-page summary.
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
        source,
        extracted: {
          name,
          shortdescription,
          description,
          date,
          duration: durationHours ? String(durationHours) : null,
          location: jsonLocation,
          facebook_link: ogUrl,
          ticket_uri: ticketUri,
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
