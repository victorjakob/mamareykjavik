// Diagnostic: reproduce the importer's short-link resolution using Node's own
// fetch (undici) — the SAME engine the dev server uses — to see why the route
// can't get the event id even though `curl` can.
//
// Run:  node fb-import-test.mjs            (defaults to your test short link)
//       node fb-import-test.mjs <other-url>
// Delete this file when we're done.

import { readFileSync } from "node:fs";
import https from "node:https";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      const v = l.slice(i + 1).trim().replace(/^["']|["']$/g, "");
      return [l.slice(0, i).trim(), v];
    }),
);

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const extractId = (s) => {
  if (!s) return null;
  let d = s;
  try { d = decodeURIComponent(s); } catch {}
  let m = d.match(/events\/(\d{6,})/);
  if (m) return m[1];
  m = d.match(/(\d{12,})/);
  return m ? m[1] : null;
};

const url = process.argv[2] || "https://fb.me/e/6H2RQGLvt";
console.log("Node:", process.version);
console.log("Input:", url, "\n");

// A) redirect:"follow" + res.url  — exactly what the route does now
try {
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9", Accept: "text/html,*/*" },
  });
  console.log("[A follow]  status:", res.status, "| res.url:", res.url);
  console.log("[A follow]  extracted id:", extractId(res.url) || "NONE");
} catch (e) {
  console.log("[A follow]  THREW:", e.message, "| cause:", e.cause?.message || "");
}

// B) redirect:"manual"  — shows whether undici hides the Location header
try {
  const res = await fetch(url, { redirect: "manual", headers: { "User-Agent": UA } });
  console.log("[B manual]  status:", res.status, "| type:", res.type, "| location:", res.headers.get("location"));
} catch (e) {
  console.log("[B manual]  THREW:", e.message);
}

// C) node https first hop  — most reliable way to read the first redirect target
const hop = await new Promise((resolve) => {
  https
    .get(url, { headers: { "User-Agent": UA } }, (r) => {
      resolve({ status: r.statusCode, location: r.headers.location || null });
      r.destroy();
    })
    .on("error", (e) => resolve({ error: e.message }));
});
console.log("[C https]   first hop:", JSON.stringify(hop), "| extracted id:", extractId(hop.location) || "NONE");

// D) if we got an id, confirm the tokens still read it
const id = extractId(url) || (hop && extractId(hop.location));
if (id) {
  console.log("\nTesting Graph read for id:", id);
  for (const name of ["FACEBOOK_WHITELOTUS_PAGE_TOKEN", "FACEBOOK_MAMA_PAGE_TOKEN"]) {
    const tok = env[name];
    if (!tok) { console.log(" ", name, "= MISSING in .env.local"); continue; }
    try {
      const r = await fetch(`https://graph.facebook.com/v22.0/${id}?fields=name,start_time&access_token=${encodeURIComponent(tok)}`);
      const j = await r.json();
      console.log(" ", name, "->", j.error ? `ERROR ${j.error.code}/${j.error.error_subcode}` : `OK: ${j.name} @ ${j.start_time}`);
    } catch (e) { console.log(" ", name, "THREW:", e.message); }
  }
}
