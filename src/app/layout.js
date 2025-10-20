import "./styles/globals.css";
import Topbar from "./components/Topbar";
import { Footer } from "./components/Footer";
import AnimatedBackground from "./components/AnimatedBackground";

import { StrictMode } from "react";
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
  title: "Mama Reykjavik - Events & Restaurant",
  description:
    "Join us for unique experiences at Mama Reykjavik. Discover events, dining, and community gatherings.",
  keywords:
    "Mama Reykjavik, events, restaurant, Iceland, cacao ceremonies, community, gatherings, spiritual, love tribe, ceremonies, conscious dining",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-96x96.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",

  authors: [{ name: "Mama Team", url: "https://mama.is" }],
  robots: "index, follow",
  canonical: "https://mama.is",

  openGraph: {
    title: "Mama Reykjavik - Events & Restaurant",
    description: "Discover unforgettable experiences at Mama Reykjavik.",
    url: "https://mama.is",
    siteName: "Mama Reykjavik",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1",
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
        url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1",
        alt: "Mama Reykjavik Logo",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Analytics scripts will be loaded conditionally based on cookie consent */}
        <StructuredData />
      </head>
      <body>
        <StrictMode>
          <AuthSessionProvider>
            <CookieConsentProvider>
              <CartProvider>
                <Topbar />
                <AnimatedBackground />
                {children}
                <ConditionalAnalytics />
                {/* SpeedInsights will be conditional based on analytics consent */}
                <Toaster />
                <Footer />
                <CookieBannerManager />
              </CartProvider>
            </CookieConsentProvider>
          </AuthSessionProvider>
        </StrictMode>
      </body>
    </html>
  );
}
