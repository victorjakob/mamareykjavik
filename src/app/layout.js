import "./styles/globals.css";
import Topbar from "./components/Topbar";
import { Footer } from "./components/Footer";
import AnimatedBackground from "./components/AnimatedBackground";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { StrictMode } from "react";

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
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

  authors: [{ name: "Mama Team", url: "https://mamareykjavik.is" }],
  robots: "index, follow",
  canonical: "https://mamareykjavik.is",

  openGraph: {
    title: "Mama Reykjavik - Events & Restaurant",
    description: "Discover unforgettable experiences at Mama Reykjavik.",
    url: "https://mamareykjavik.is",
    siteName: "Mama Reykjavik",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Logo%20bigger.jpeg?alt=media&token=704baa9f-90bd-47f2-900c-0ab8535eed0b", // Replace with a better image (1200x630 recommended)
        width: 1200,
        height: 630,
        alt: "Mama Reykjavik - Logo",
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
      <body>
        <StrictMode>
          <AnimatedBackground />
          <Topbar />
          {children}
          <Analytics />
          <SpeedInsights />
          <Footer />
        </StrictMode>
      </body>
    </html>
  );
}
