// /tribe-card/request — the public request form (server component wrapper).
//
// The form lives in ../components/TribeCardRequestClient.jsx; this wrapper
// exists so we can export SEO metadata. We also set `robots: noindex` —
// a form-submission page has no business ranking in search results.

import TribeCardRequestClient from "../components/TribeCardRequestClient";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/tribe-card/request";

  const translations = {
    en: {
      title: "Request your Tribe Card | Mama Reykjavík",
      description:
        "Request your digital Tribe Card from Mama Reykjavík. We'll review personally and email your card once approved.",
      ogTitle: "Request your Tribe Card — Mama Reykjavík",
      ogDescription:
        "Fill in a short form and we'll send your digital Tribe Card once approved.",
    },
    is: {
      title: "Sæktu um Ættbálkurkortið | Mama Reykjavík",
      description:
        "Sæktu um stafræna Ættbálkurkortið þitt frá Mama Reykjavík. Við förum yfir persónulega og sendum kortið þegar það hefur verið samþykkt.",
      ogTitle: "Sæktu um Ættbálkurkortið — Mama Reykjavík",
      ogDescription:
        "Fylltu út stutt eyðublað og við sendum stafræna Ættbálkurkortið þegar það hefur verið samþykkt.",
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
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: alternates.canonical,
      type: "website",
      locale: ogLocale(language),
    },
  };
}

export default function TribeCardRequestPage() {
  return <TribeCardRequestClient />;
}
