// /membership — Mama membership landing.
//
// Server component wrapper. The interactive UI (tier cards, High Ticket amount,
// join buttons wired to the /api/membership/* endpoints) lives in
// components/MembershipLandingClient.jsx so we can export metadata.
//
// Locale is read from the `x-locale` request header (set by proxy.js),
// so this file serves both /membership and /is/membership.

import MembershipLandingClient from "./components/MembershipLandingClient";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/membership";

  const translations = {
    en: {
      title: "Membership | Mama Reykjavík",
      description:
        "Join the Mama community — Free or Mama Tribe, with retreats & private journeys coming later. Belong to our plant-based table, events, and wider circle.",
      ogTitle: "Membership — Mama Reykjavík",
      ogDescription:
        "Stay close for free, or join the Mama Tribe for the 20% Tribe Card, early access and the monthly Letter from Mama. A community-first kitchen in Reykjavík.",
      twitterTitle: "Membership — Mama Reykjavík",
      twitterDescription:
        "Free or Mama Tribe — two ways to belong to the Mama community, with deeper journeys coming later.",
    },
    is: {
      title: "Aðild | Mama Reykjavík",
      description:
        "Gakktu í Mama samfélagið — Frítt eða Mama Tribe, og retreat og einkaferðalög koma síðar. Tilheyrðu jurtaborðinu, viðburðunum og stærri hringnum.",
      ogTitle: "Aðild — Mama Reykjavík",
      ogDescription:
        "Vertu með frítt, eða gakktu í Mama Tribe fyrir 20% Tribe kortið, forgang að viðburðum og mánaðarlegt Bréf frá Mama. Samfélagsmiðað eldhús í Reykjavík.",
      twitterTitle: "Aðild — Mama Reykjavík",
      twitterDescription:
        "Frítt eða Mama Tribe — tvær leiðir til að tilheyra Mama samfélaginu, og dýpri ferðalög koma síðar.",
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

export default function MembershipLandingPage() {
  return <MembershipLandingClient />;
}
