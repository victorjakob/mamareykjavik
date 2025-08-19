import React from "react";
import HeroCacao from "./HeroCacao";
import CacaoIngredients from "./Ingredients";
import CacaoPreparation from "./Preparation";
import CacaoCeremony from "./Ceremony";
import CacaoCTA from "./CTA";

export const metadata = {
  title: "How to Prepare Ceremonial Cacao | Mama Reykjavik",
  description:
    "Step-by-step guide to preparing ceremonial cacao. Learn about ingredients, mindful preparation, and cacao rituals at Mama Reykjavik.",
  keywords:
    "ceremonial cacao, how to prepare cacao, cacao ceremony, cacao ritual, Mama Reykjavik, cacao recipe, mindful preparation, cacao Iceland, spiritual cacao, cacao drink",
  canonical: "https://mama.is/cacao-prep",
  openGraph: {
    title: "How to Prepare Ceremonial Cacao | Mama Reykjavik",
    description:
      "Step-by-step guide to preparing ceremonial cacao. Learn about ingredients, mindful preparation, and cacao rituals at Mama Reykjavik.",
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
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Prepare Ceremonial Cacao | Mama Reykjavik",
    description:
      "Step-by-step guide to preparing ceremonial cacao. Learn about ingredients, mindful preparation, and cacao rituals at Mama Reykjavik.",
    images: [
      {
        url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752335005/caca_c1ku48.webp",
        alt: "Ceremonial Cacao Preparation - Mama Reykjavik",
      },
    ],
  },
  robots: "index, follow",
};

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
