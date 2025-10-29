import React from "react";
import HeroCacao from "./HeroCacao";
import CacaoIngredients from "./Ingredients";
import CacaoPreparation from "./Preparation";
import CacaoCeremony from "./Ceremony";
import CacaoCTA from "./CTA";
import { cookies } from "next/headers";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";

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

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    canonical: "https://mama.is/cacao-prep",
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: "https://mama.is/cacao-prep",
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
      locale: language === "is" ? "is_IS" : "en_US",
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
