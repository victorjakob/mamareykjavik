import PrivateSpacePage from "./PrivateSpacePage";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";
import { PRIVATE_SPACE_BANNER_OG } from "@/lib/images";
import { getPrivateSpaceRobots } from "@/lib/private-space/config";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/private-space";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "The Private Space | Mama Reykjavik",
      description:
        "A quiet private room in downtown Reykjavík for sessions, small groups, bodywork, talks, photoshoots and anything that needs a bit of privacy.",
      ogTitle: "The Private Space — private room in downtown Reykjavík",
      ogDescription:
        "A fully private room on the lower floor under the White Lotus area, with its own entrance and access. Book by the hour, day, or weekly.",
    },
    is: {
      title: "Einkarýmið | Mama Reykjavík",
      description:
        "Rólegt einkarými í miðbæ Reykjavíkur fyrir tíma, litla hópa, líkamsvinnu, samtöl, myndatökur og annað sem þarf næði.",
      ogTitle: "Einkarýmið — rólegt rými í miðbæ Reykjavíkur",
      ogDescription:
        "Alveg prívat rými á neðri hæðinni undir White Lotus svæðinu, með eigin inngangi og aðgengi. Bókaðu eftir klukkustund, degi eða viku.",
    },
  };

  const t = translations[language] || translations.en;
  const formatted = formatMetadata({ title: t.title, description: t.description });

  return {
    title: formatted.title,
    description: formatted.description,
    alternates,
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: alternates.canonical,
      images: [
        {
          url: PRIVATE_SPACE_BANNER_OG,
          width: 1200,
          height: 630,
          alt: "The Private Space — Mama Reykjavik",
        },
      ],
      type: "website",
      locale: ogLocale(language),
    },
    twitter: {
      card: "summary_large_image",
      title: t.ogTitle,
      description: t.ogDescription,
      images: [PRIVATE_SPACE_BANNER_OG],
    },
    robots: getPrivateSpaceRobots(),
  };
}

export default async function Page() {
  const language = await getLocaleFromHeaders();
  return <PrivateSpacePage locale={language} />;
}
