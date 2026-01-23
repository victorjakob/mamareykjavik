import React from "react";
import HeroCacao from "./HeroCacao";
import CacaoIngredients from "./Ingredients";
import CacaoPreparation from "./Preparation";
import CacaoCeremony from "./Ceremony";
import CacaoCTA from "./CTA";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/cacao-prep";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "How to Prepare Ceremonial Cacao | Mama Reykjavik",
      description:
        "Step-by-step guide to preparing ceremonial cacao. Learn about ingredients, mindful preparation, and cacao rituals at Mama Reykjavik.",
      keywords:
        "ceremonial cacao, how to prepare cacao, cacao ceremony, cacao ritual, Mama Reykjavik, cacao recipe, mindful preparation, cacao Iceland, spiritual cacao, cacao drink",
      ogTitle: "How to Prepare Ceremonial Cacao | Mama Reykjavik",
      ogDescription:
        "Step-by-step guide to preparing ceremonial cacao. Learn about ingredients, mindful preparation, and cacao rituals at Mama Reykjavik.",
      twitterTitle: "How to Prepare Ceremonial Cacao | Mama Reykjavik",
      twitterDescription:
        "Step-by-step guide to preparing ceremonial cacao. Learn about ingredients, mindful preparation, and cacao rituals at Mama Reykjavik.",
    },
    is: {
      title: "Hvernig á að undirbúa athafnacacao | Mama Reykjavík",
      description:
        "Skref-fyrir-skref leiðbeiningar um undirbúning athafnacacao. Lærðu um innihaldsefni, meðvituð undirbúning og cacao athafnir á Mama Reykjavík.",
      keywords:
        "athafnacacao, hvernig á að undirbúa cacao, cacao athafn, cacao rituál, Mama Reykjavík, cacao uppskrift, meðvituð undirbúning, cacao Ísland, andleg cacao, cacao drykkur",
      ogTitle: "Hvernig á að undirbúa athafnacacao | Mama Reykjavík",
      ogDescription:
        "Skref-fyrir-skref leiðbeiningar um undirbúning athafnacacao. Lærðu um innihaldsefni, meðvituð undirbúning og cacao athafnir á Mama Reykjavík.",
      twitterTitle: "Hvernig á að undirbúa athafnacacao | Mama Reykjavík",
      twitterDescription:
        "Skref-fyrir-skref leiðbeiningar um undirbúning athafnacacao. Lærðu um innihaldsefni, meðvituð undirbúning og cacao athafnir á Mama Reykjavík.",
    },
  };

  const t = translations[language];
  const formatted = formatMetadata({
    title: t.title,
    description: t.description,
  });

  return {
    title: formatted.title,
    description: formatted.description,
    keywords: t.keywords,
    alternates,
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: alternates.canonical,
      siteName: "Mama Reykjavik",
      images: [
        {
          url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752335005/caca_c1ku48.webp",
          width: 1200,
          height: 630,
          alt: "Ceremonial Cacao Preparation - Mama Reykjavik",
        },
      ],
      type: "article",
      locale: ogLocale(language),
    },
    twitter: {
      card: "summary_large_image",
      title: t.twitterTitle,
      description: t.twitterDescription,
      images: [
        {
          url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752335005/caca_c1ku48.webp",
          alt: "Ceremonial Cacao Preparation - Mama Reykjavik",
        },
      ],
    },
    robots: "index, follow",
  };
}

const CacaoPrepPage = () => (
  <main className="min-h-screen relative overflow-x-hidden">
    {/* Decorative cacao plant image in top right */}

    <div className="relative z-10">
      <HeroCacao />
      <CacaoIngredients />
      <CacaoPreparation />
      <CacaoCeremony />
      <CacaoCTA />
    </div>
  </main>
);

export default CacaoPrepPage;
