import { cookies } from "next/headers";
import FiveMealOfferClient from "./FiveMealOfferClient";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";

  const translations = {
    en: {
      title: "5 Meals For Winter - Limited Time Offer | Mama Reykjavik",
      description:
        "⚡ 72-hour flash sale! Get 5 soul-warming meals for 14,900 kr (save 6,250 kr). Valid Dec 2025 - May 2026. Includes free drink with your 5th meal. 100% plant-based, made with love in Reykjavik.",
      keywords:
        "Mama Reykjavik, meal card, winter meals, vegan food Iceland, plant-based meals, Reykjavik restaurant, meal deal, curry, sustainable dining, conscious food",
    },
    is: {
      title: "5 Réttir Fyrir Veturinn - Takmarkað Tilboð | Mama Reykjavík",
      description:
        "⚡ 72 klst tilboð! Fáðu 5 sálvarmandi rétti á 14.900 kr (sparaðu 6.250 kr). Gilt des 2025 - maí 2026. Innifalið ókeypis drykk með 5. högginu. 100% plöntubundið, gert með ást í Reykjavík.",
      keywords:
        "Mama Reykjavík, máltíðakort, vetrarmáltíðir, vegan matur Ísland, jurtamatur, Reykjavík veitingastaður, máltíðatilboð, karrý, sjálfbær veitingaþjónusta",
    },
  };

  const t = translations[language];
  const ogImage =
    "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1762502519/Screenshot_2025-11-07_at_15.00.51_lfef1n.png";

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    authors: [{ name: "Mama Reykjavik" }],
    creator: "Mama Reykjavik",
    publisher: "Mama Reykjavik",

    alternates: {
      canonical: "https://mama.is/5",
      languages: {
        en: "https://mama.is/5",
        is: "https://mama.is/5",
      },
    },

    openGraph: {
      title: t.title,
      description: t.description,
      url: "https://mama.is/5",
      siteName: "Mama Reykjavik",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "5 Meals for Winter - Special Offer at Mama Reykjavik",
        },
      ],
      locale: language === "is" ? "is_IS" : "en_US",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: t.description,
      images: [ogImage],
      creator: "@mamarestaurant",
      site: "@mamarestaurant",
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    other: {
      "price:amount": "14900",
      "price:currency": "ISK",
      "product:availability": "in_stock",
      "product:condition": "new",
      "og:price:amount": "14900",
      "og:price:currency": "ISK",
    },
  };
}

export default async function FiveMealOffer() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";

  const translations = {
    en: {
      name: "5 Meals for Winter Card",
      description:
        "Five soul-warming plant-based main meals valid from December 2025 to May 2026. Includes free ceremonial cacao, tea, or coffee with your 5th meal.",
    },
    is: {
      name: "5 Réttir Fyrir Veturinn Kort",
      description:
        "Fimm sálvarmandi jurtabundnir aðalréttir gilt frá desember 2025 til maí 2026. Innifalið ókeypis athafnacacao, te eða kaffi með 5. högginu.",
    },
  };

  const t = translations[language];

  // Structured data for Google
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: t.name,
    description: t.description,
    image:
      "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1762502519/Screenshot_2025-11-07_at_15.00.51_lfef1n.png",
    brand: {
      "@type": "Restaurant",
      name: "Mama Reykjavik",
      url: "https://mama.is",
      logo: "https://mama.is/mamaimg/mamalogo.png",
    },
    offers: {
      "@type": "Offer",
      price: "14900",
      priceCurrency: "ISK",
      availability: "https://schema.org/InStock",
      url: "https://mama.is/5",
      validFrom: "2025-12-01",
      validThrough: "2026-05-31",
      priceValidUntil: "2026-05-31",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "1",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <FiveMealOfferClient initialLanguage={language} />
    </>
  );
}
