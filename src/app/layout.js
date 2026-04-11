import "./styles/globals.css";
import Topbar from "./components/Topbar";
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

export const metadata = {
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

  openGraph: {
    title: "Mama Reykjavik - Events & Restaurant",
    description: "Discover unforgettable experiences at Mama Reykjavik.",
    url: "https://mama.is",
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
    locale: "en_US",
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

export default async function RootLayout({ children }) {
  const headerStore = await headers();
  const language = headerStore.get("x-locale") || "en";
  return (
    <html lang={language}>
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
                    <Topbar />
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
