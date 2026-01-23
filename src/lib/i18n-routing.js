export function stripIsPrefix(pathname) {
  if (!pathname) return "/";
  if (pathname === "/is") return "/";
  if (pathname.startsWith("/is/")) return pathname.slice(3);
  return pathname;
}

export function addIsPrefix(pathname) {
  if (!pathname || pathname === "/") return "/is";
  return `/is${pathname}`;
}

// Exact translated, non-dynamic base paths (no /is prefix)
const TRANSLATED_STATIC = new Set([
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
]);

export function hasIsCounterpart(pathname) {
  const base = stripIsPrefix(pathname);

  if (TRANSLATED_STATIC.has(base)) return true;

  // Events detail: /events/<slug> only (exclude /ticket, /manager, etc)
  if (base.startsWith("/events/")) {
    const rest = base.slice("/events/".length);
    if (!rest) return false;
    if (rest.startsWith("manager")) return false;
    if (rest.includes("/")) return false; // only one segment
    return true;
  }

  // Shop category/product pages:
  // - /shop/<category>
  // - /shop/<category>/<product>
  // Exclude internal flows like /shop/cart or /shop/success
  if (base.startsWith("/shop/")) {
    const rest = base.slice("/shop/".length);
    if (!rest) return false;
    if (rest === "cart" || rest === "success") return false;
    // allow 1-2 segments
    const parts = rest.split("/").filter(Boolean);
    return parts.length === 1 || parts.length === 2;
  }

  return false;
}

export function localizeHref(currentPathname, href) {
  // Only localize internal absolute-path hrefs.
  if (!href || typeof href !== "string" || !href.startsWith("/")) return href;

  const isLocale = currentPathname === "/is" || currentPathname?.startsWith("/is/");
  if (!isLocale) return href;

  // Don't double-prefix.
  if (href === "/is" || href.startsWith("/is/")) return href;

  // Only localize if that target actually has an /is route.
  return hasIsCounterpart(href) ? addIsPrefix(href) : href;
}

