import "./styles/globals.css";
import { Cormorant_Garamond } from "next/font/google";
import DarkNavbar from "./components/Navbar/DarkNavbar";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
import { Footer } from "./components/Footer";
import AnimatedBackground from "./components/AnimatedBackground";
import { LanguageProvider } from "@/hooks/useLanguage";
import ErrorBoundary from "@/components/ErrorBoundary";
import ChunkReloadHandler from "@/components/ChunkReloadHandler";

import { StrictMode } from "react";
import { headers } from "next/headers";
import { Toaster } from "react-hot-toast";
import AuthSessionProvider from "../providers/SessionProvider";
import Script from "next/script";
import { CartProvider } from "../providers/CartProvider";
import { CookieConsentProvider } from "../providers/CookieConsentProvider";
import CookieBannerManager from "./components/CookieBannerManager";
import ConditionalAnalytics from "./components/ConditionalAnalytics";
import StructuredData from "./components/StructuredData";

export const viewport = {
  themeColor: "#ffffff", // Optional but recommended
  width: "device-width",
  height: "device-height", // Optional
  initialScale: 1.0,
  minimumScale: 1.0,
  maximumScale: 5.0,
  userScalable: "yes",
  interactiveWidget: "resizes-content",
  viewportFit: "cover",
};

// Pages that exist in both English (/ and /<path>) and Icelandic (/is/<path>).
// Keep this list in sync with `translatedStaticPaths` in /api/sitemap/route.js.
// Used by `generateMetadata` below to emit proper hreflang + canonical per page.
const TRANSLATED_PATHS = new Set([
  "/about",
  "/events",
  "/past-events",
  "/contact",
  "/reviews",
  "/take-away",
  "/restaurant",
  "/restaurant/book-table",
  "/whitelotus",
  "/whitelotus/booking",
  "/whitelotus/rent",
  "/kornhladan",
  "/shop",
  "/shop/ceremonial-cacao",
  "/cacao-prep",
  "/policies",
  "/policies/terms",
  "/policies/privacy",
  "/policies/store",
  "/tribe-card",
  "/tribe-card/request",
  "/catering",
  "/catering/quote",
  "/catering/corporate-lunch",
  "/collaborations",
  "/brand",
  "/giftcard",
  "/summer-market",
  "/summer-market/apply",
]);

// Per-request metadata. Lets us emit the correct canonical URL and
// hreflang alternates based on the current pathname + language.
// Google strongly prefers canonical + self-referencing hreflang on every
// page; without it, /en and /is content can compete with each other.
export async function generateMetadata() {
  const headerStore = await headers();
  const locale = headerStore.get("x-locale") || "en";
  const rawPath = headerStore.get("x-pathname") || "/";

  // Strip trailing slash (except root) and the /is prefix when computing
  // the "base" path used for hreflang mapping.
  const pathname = rawPath.length > 1 ? rawPath.replace(/\/$/, "") : "/";
  const basePath =
    pathname === "/is"
      ? "/"
      : pathname.startsWith("/is/")
        ? pathname.slice(3) || "/"
        : pathname;

  const canonical =
    locale === "is"
      ? basePath === "/"
        ? "/is"
        : `/is${basePath}`
      : basePath;

  const hasTranslation =
    basePath === "/" ? true : TRANSLATED_PATHS.has(basePath);

  // Only emit hreflang alternates when both language variants exist.
  // Emitting a bogus /is/<page> for English-only routes would waste crawl
  // budget and confuse Googlebot.
  const alternates = hasTranslation
    ? {
        canonical,
        languages: {
          en: basePath,
          "is-IS": basePath === "/" ? "/is" : `/is${basePath}`,
          "x-default": basePath,
        },
      }
    : { canonical };

  return {
    metadataBase: new URL("https://mama.is"),
    title: "Mama Reykjavik | Plant-Based Restaurant & Events",
    description:
      "Mama Reykjavik — 100% plant-based world-inspired restaurant & White Lotus event space. Cacao ceremonies, yoga, live music, conscious dining. Rated 4.9/5 in Reykjavik. Bankastræti 2.",
    keywords:
      "Mama Reykjavik, vegan restaurant Reykjavik, plant-based Iceland, cacao ceremony Reykjavik, White Lotus venue, conscious dining Iceland, best vegan restaurant Iceland, events Reykjavik, Bankastræti restaurant",
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-96x96.png",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",

    authors: [{ name: "Mama Team", url: "https://mama.is" }],
    robots: "index, follow",

    alternates,

    openGraph: {
      title: "Mama Reykjavik - Events & Restaurant",
      description: "Discover unforgettable experiences at Mama Reykjavik.",
      url: `https://mama.is${canonical}`,
      siteName: "Mama Reykjavik",
      images: [
        {
          url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/mamabanner.jpg",
          width: 1200,
          height: 630,
          alt: "Mama Reykjavik - Restaurant & Events",
        },
      ],
      type: "website",
      locale: locale === "is" ? "is_IS" : "en_US",
    },

    twitter: {
      card: "summary_large_image",
      title: "Mama Reykjavik - Events & Dining",
      description: "Discover unique experiences at Mama Reykjavik.",
      images: [
        {
          url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/mamabanner.jpg",
          alt: "Mama Reykjavik Logo",
        },
      ],
    },
  };
}

export default async function RootLayout({ children }) {
  const headerStore = await headers();
  const language = headerStore.get("x-locale") || "en";
  return (
    <html lang={language} className={cormorant.variable}>
      <head>
        {/* Analytics scripts will be loaded conditionally based on cookie consent */}
        <StructuredData />
        {/* NOTE: hreflang is emitted per-page only when a translated /is counterpart exists. */}
      </head>
      <body>
        <StrictMode>
          <ErrorBoundary>
            <AuthSessionProvider>
              <CookieConsentProvider>
                <CartProvider>
                  <LanguageProvider initialLanguage={language}>
                    <ChunkReloadHandler />
                    <DarkNavbar />
                    <AnimatedBackground />
                    {children}
                    <ConditionalAnalytics />
                    {/* SpeedInsights will be conditional based on analytics consent */}
                    <Toaster />
                    <Footer />
                    <CookieBannerManager />
                  </LanguageProvider>
                </CartProvider>
              </CookieConsentProvider>
            </AuthSessionProvider>
          </ErrorBoundary>
        </StrictMode>
      </body>
    </html>
  );
}
