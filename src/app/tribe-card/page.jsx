// /tribe-card — landing page (server component wrapper).
//
// The interactive UI lives in components/TribeCardLandingClient.jsx; this
// file exists so we can export proper SEO metadata (a client component
// with "use client" cannot export metadata in the App Router).
//
// Locale is read from the `x-locale` request header (set by proxy.js)
// so the same file serves /tribe-card AND /is/tribe-card.

import TribeCardLandingClient from "./components/TribeCardLandingClient";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/tribe-card";

  const translations = {
    en: {
      title: "The Tribe Card | Mama Reykjavík",
      description:
        "A small thank-you to the people who have made Mama home — a digital Tribe Card with a discount on food & drinks. Request yours today.",
      ogTitle: "The Tribe Card — Mama Reykjavík",
      ogDescription:
        "Mama's digital Tribe Card. A discount on food & drinks for the people who have made this community home.",
      twitterTitle: "The Tribe Card — Mama Reykjavík",
      twitterDescription:
        "A small thank-you to the people who have made Mama home.",
    },
    is: {
      title: "Ættbálkurkortið | Mama Reykjavík",
      description:
        "Lítill þakklætisvottur til fólksins sem hefur gert Mama að heimili — stafrænt Ættbálkurkort með afslætti af mati og drykk. Sæktu um þitt í dag.",
      ogTitle: "Ættbálkurkortið — Mama Reykjavík",
      ogDescription:
        "Stafræna Ættbálkurkort Mama. Afsláttur af mati og drykk fyrir fólkið sem hefur gert þetta samfélag að heimili.",
      twitterTitle: "Ættbálkurkortið — Mama Reykjavík",
      twitterDescription:
        "Lítill þakklætisvottur til fólksins sem hefur gert Mama að heimili.",
    },
  };

  const t = translations[language];
  const formatted = formatMetadata({
    title: t.title,
    description: t.description,
  });
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  return {
    title: formatted.title,
    description: formatted.description,
    alternates,
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: alternates.canonical,
      type: "website",
      locale: ogLocale(language),
    },
    twitter: {
      card: "summary_large_image",
      title: t.twitterTitle,
      description: t.twitterDescription,
    },
  };
}

export default function TribeCardLandingPage() {
  return <TribeCardLandingClient />;
}
