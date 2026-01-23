import { headers } from "next/headers";

export const SITE_ORIGIN = "https://mama.is";

export async function getLocaleFromHeaders() {
  const h = await headers();
  const locale = h.get("x-locale");
  return locale === "is" ? "is" : "en";
}

/**
 * Build an absolute URL for a base pathname (no /is prefix).
 * - locale=en: /about -> https://mama.is/about
 * - locale=is: /about -> https://mama.is/is/about
 * - locale=is: / -> https://mama.is/is
 */
export function urlFor({ locale, pathname }) {
  if (!pathname.startsWith("/")) {
    throw new Error(`urlFor: pathname must start with '/': ${pathname}`);
  }

  const base = pathname === "/" ? "" : pathname;
  const prefix = locale === "is" ? "/is" : "";
  return `${SITE_ORIGIN}${prefix}${base}`;
}

/**
 * Next metadata alternates helper.
 * If translated=true, emits hreflang for en/is + x-default pointing to EN.
 */
export function alternatesFor({ locale, pathname, translated }) {
  const canonical = urlFor({ locale, pathname });

  if (!translated) {
    return { canonical };
  }

  return {
    canonical,
    languages: {
      en: urlFor({ locale: "en", pathname }),
      is: urlFor({ locale: "is", pathname }),
      "x-default": urlFor({ locale: "en", pathname }),
    },
  };
}

export function ogLocale(locale) {
  return locale === "is" ? "is_IS" : "en_US";
}

