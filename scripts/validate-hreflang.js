#!/usr/bin/env node
/**
 * Validate hreflang/canonical rules for the bilingual routing strategy.
 *
 * This script does not fetch the site — it validates *expected* mapping rules
 * based on our translation scope.
 */
const TRANSLATED_STATIC = [
  "/about",
  "/restaurant",
  "/restaurant/book-table",
  "/whitelotus",
  "/whitelotus/booking",
  "/whitelotus/rent",
  "/contact",
  "/cacao-prep",
  "/policies",
  "/policies/terms",
  "/policies/privacy",
  "/policies/store",
  "/events",
  "/shop",
  "/shop/ceremonial-cacao",
];

const SITE_ORIGIN = "https://mama.is";

function toUrl(pathname, locale) {
  if (pathname === "/") return locale === "is" ? `${SITE_ORIGIN}/is` : SITE_ORIGIN;
  return locale === "is"
    ? `${SITE_ORIGIN}/is${pathname}`
    : `${SITE_ORIGIN}${pathname}`;
}

function isTranslatedDynamic(pathname) {
  // events detail: /events/<slug> only
  if (pathname.startsWith("/events/")) {
    const rest = pathname.slice("/events/".length);
    if (!rest) return false;
    if (rest.includes("/")) return false;
    return true;
  }

  // shop: /shop/<category> or /shop/<category>/<product>
  if (pathname.startsWith("/shop/")) {
    const rest = pathname.slice("/shop/".length);
    if (!rest) return false;
    if (rest === "cart" || rest === "success") return false;
    const parts = rest.split("/").filter(Boolean);
    return parts.length === 1 || parts.length === 2;
  }

  return false;
}

function isTranslatedPath(pathname) {
  if (TRANSLATED_STATIC.includes(pathname)) return true;
  return isTranslatedDynamic(pathname);
}

function validatePair(pathname) {
  const en = toUrl(pathname, "en");
  const is = toUrl(pathname, "is");
  const xDefault = en;

  const errors = [];
  if (en === is) errors.push("en and is URLs are identical");
  if (xDefault !== en) errors.push("x-default must match EN URL");

  return { en, is, xDefault, errors };
}

function run() {
  console.log("");
  console.log("hreflang / canonical validation (expected rules)");
  console.log("------------------------------------------------");

  const examples = [
    ...TRANSLATED_STATIC,
    "/events/<slug>",
    "/shop/<category>",
    "/shop/<category>/<product>",
  ];

  let hasErrors = false;
  for (const path of examples) {
    const normalized = path.replace("<slug>", "example")
      .replace("<category>", "tea")
      .replace("<product>", "sample-product");
    const res = validatePair(normalized);
    const issues = res.errors.length ? `  ❌ ${res.errors.join("; ")}` : "";
    if (res.errors.length) hasErrors = true;
    console.log(`${path}`);
    console.log(`  EN: ${res.en}`);
    console.log(`  IS: ${res.is}`);
    console.log(`  x-default: ${res.xDefault}${issues}`);
  }

  console.log("");
  console.log(
    hasErrors
      ? "Validation failed: check errors above."
      : "Validation passed: no duplicate hreflang targets."
  );
  console.log("");
}

run();

