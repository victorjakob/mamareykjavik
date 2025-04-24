import "./styles/globals.css";
import Topbar from "./components/Topbar";
import { Footer } from "./components/Footer";
import AnimatedBackground from "./components/AnimatedBackground";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { StrictMode } from "react";
import { Toaster } from "react-hot-toast";
import AuthSessionProvider from "../lib/SessionProvider";

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
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-B028MEYKQT"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-B028MEYKQT');
          `,
          }}
        />
      </head>
      <body>
        <StrictMode>
          <AuthSessionProvider>
            <Topbar />
            <AnimatedBackground />
            {children}
            <SpeedInsights />
            <Toaster />
            <Footer />
          </AuthSessionProvider>
        </StrictMode>
      </body>
    </html>
  );
}
