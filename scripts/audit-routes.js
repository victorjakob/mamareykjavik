#!/usr/bin/env node
/**
 * Route audit for Next.js App Router.
 *
 * Produces a table:
 *   route | type(A/B/C) | recommended final URLs
 *
 * Classification rules (project-specific):
 * - A: Translated route (EN at /..., IS at /is/...) for the scopes you selected.
 * - B: English-only route (no /is equivalent).
 * - C: Icelandic-only route (rare; flagged if discovered).
 */
const fs = require("node:fs");
const path = require("node:path");

const REPO_ROOT = path.resolve(__dirname, "..");
const APP_DIR = path.join(REPO_ROOT, "src", "app");

const PAGE_EXT_RE = /\.((js|jsx|ts|tsx))$/;

function isPageFile(file) {
  return file.endsWith("page.js") || file.endsWith("page.jsx") || file.endsWith("page.ts") || file.endsWith("page.tsx");
}

function walk(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...walk(p));
    } else if (ent.isFile() && PAGE_EXT_RE.test(ent.name) && isPageFile(ent.name)) {
      out.push(p);
    }
  }
  return out;
}

function fileToRoute(filePath) {
  // Convert /src/app/.../page.(js|jsx|ts|tsx) -> route
  const rel = path.relative(APP_DIR, filePath);
  const dir = path.dirname(rel);
  const segments = dir === "." ? [] : dir.split(path.sep);

  // Drop route groups (e.g. (event-payment))
  const cleaned = segments.filter((s) => !(s.startsWith("(") && s.endsWith(")")));

  // Convert Next dynamic segments
  const routeSegs = cleaned.map((s) => s);

  const route = "/" + routeSegs.join("/");
  return route === "/" ? "/" : route.replace(/\/+/g, "/");
}

// Your selected translated scopes (URL-based).
// Keep this list explicit so we never accidentally create /is for EN-only sections.
const TRANSLATED_RULES = [
  // Core marketing pages selected
  { test: (p) => p === "/about" },
  { test: (p) => p === "/restaurant" },
  { test: (p) => p === "/restaurant/book-table" },
  { test: (p) => p === "/whitelotus" },
  { test: (p) => p === "/whitelotus/booking" },
  { test: (p) => p === "/whitelotus/rent" },
  { test: (p) => p === "/contact" },
  { test: (p) => p === "/cacao-prep" },
  { test: (p) => p === "/policies" },
  { test: (p) => p === "/policies/terms" },
  { test: (p) => p === "/policies/privacy" },
  { test: (p) => p === "/policies/store" },

  // Events selected
  { test: (p) => p === "/events" },
  // Only the public event detail page (NOT ticket checkout, NOT manager tools)
  { test: (p) => p === "/events/[slug]" },

  // Shop selected (dynamic)
  { test: (p) => p === "/shop" },
  // Public shop marketing/product browsing (NOT cart/checkout success pages)
  { test: (p) => p === "/shop/ceremonial-cacao" },
  { test: (p) => p === "/shop/[category]" },
  { test: (p) => p === "/shop/[category]/[slug]" },
];

function isTranslatedRoute(routeFromFile) {
  // routeFromFile will include [slug] for dynamic pages (e.g. /events/[slug])
  return TRANSLATED_RULES.some((r) => r.test(routeFromFile));
}

function toFinalUrls(routeFromFile) {
  // Convert file-style dynamic segments to URL examples for readability.
  const example = routeFromFile
    .replaceAll("[slug]", "<slug>")
    .replaceAll("[token]", "<token>")
    .replaceAll("[id]", "<id>")
    .replaceAll("[category]", "<category>")
    .replaceAll("[bookingref]", "<bookingref>");

  const en = `https://mama.is${example === "/" ? "" : example}`;
  const is = `https://mama.is/is${example === "/" ? "" : example}`;
  return { en, is };
}

function pad(str, len) {
  if (str.length >= len) return str;
  return str + " ".repeat(len - str.length);
}

function main() {
  if (!fs.existsSync(APP_DIR)) {
    console.error(`Could not find App Router directory at ${APP_DIR}`);
    process.exit(1);
  }

  const pageFiles = walk(APP_DIR);
  const routes = pageFiles
    .map((fp) => ({ file: fp, route: fileToRoute(fp) }))
    .sort((a, b) => a.route.localeCompare(b.route));

  // Detect existing /is routes in codebase (C candidates if EN missing)
  const enRoutes = new Set(routes.filter((r) => !r.route.startsWith("/is")).map((r) => r.route));
  const isRoutes = new Set(routes.filter((r) => r.route.startsWith("/is")).map((r) => r.route));

  const rows = [];
  for (const r of routes) {
    const route = r.route;
    let type = "B";

    if (route.startsWith("/is")) {
      // If /is route exists but EN counterpart doesn't, classify as C
      const counterpart = route.replace(/^\/is(\/|$)/, "/");
      type = enRoutes.has(counterpart) ? "A" : "C";
    } else {
      type = isTranslatedRoute(route) ? "A" : "B";
    }

    const urls = toFinalUrls(route.startsWith("/is") ? route.replace(/^\/is(\/|$)/, "/") : route);
    const finalUrls =
      type === "A"
        ? `${urls.en}  <->  ${urls.is}`
        : type === "C"
          ? `(IS-only) ${urls.is}`
          : urls.en;

    rows.push({ route, type, finalUrls });
  }

  const routeW = Math.max(20, ...rows.map((r) => r.route.length));
  const typeW = 4;

  console.log("");
  console.log("Route audit (Next.js App Router)");
  console.log("--------------------------------");
  console.log(`${pad("route", routeW)}  ${pad("type", typeW)}  recommended_final_url(s)`);
  console.log(`${"-".repeat(routeW)}  ${"-".repeat(typeW)}  ${"-".repeat(60)}`);

  for (const row of rows) {
    console.log(`${pad(row.route, routeW)}  ${pad(row.type, typeW)}  ${row.finalUrls}`);
  }

  const counts = rows.reduce(
    (acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    },
    { A: 0, B: 0, C: 0 }
  );

  console.log("");
  console.log(`Totals: A(translated)=${counts.A}  B(EN-only)=${counts.B}  C(IS-only)=${counts.C}`);
  console.log("");
}

main();

