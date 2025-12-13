import { cookies } from "next/headers";
import GiftCardClient from "./GiftCardClient";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";

  const translations = {
    en: {
      title: "Holiday Gift Card - Perfect Gift | Mama Reykjavik",
      description:
        "Give the gift of delicious plant-based meals! Choose any amount from 1,000 to 50,000 kr. Available as email, pickup, or mail delivery. Perfect holiday gift for food lovers.",
      keywords:
        "Mama Reykjavik, gift card, holiday gift, vegan food Iceland, plant-based meals, Reykjavik restaurant, gift voucher, sustainable dining",
    },
    is: {
      title: "Jólagjöf - Fullkomið Gjöf | Mama Reykjavík",
      description:
        "Gefðu gjöf af ljúffengum jurtabundnum réttum! Veldu hvaða upphæð sem er frá 1.000 til 50.000 kr. Fáanlegt sem tölvupóstur, afhending í verslun eða póstsending. Fullkomin jólagjöf fyrir matarástkennur.",
      keywords:
        "Mama Reykjavík, gjafakort, jólagjöf, vegan matur Ísland, jurtamatur, Reykjavík veitingastaður, gjafabréf, sjálfbær veitingaþjónusta",
    },
  };

  const t = translations[language];

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    authors: [{ name: "Mama Reykjavik" }],
    creator: "Mama Reykjavik",
    publisher: "Mama Reykjavik",

    alternates: {
      canonical: "https://mama.is/giftcard",
      languages: {
        en: "https://mama.is/giftcard",
        is: "https://mama.is/giftcard",
      },
    },

    openGraph: {
      title: t.title,
      description: t.description,
      url: "https://mama.is/giftcard",
      siteName: "Mama Reykjavik",
      locale: language === "is" ? "is_IS" : "en_US",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: t.description,
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
  };
}

export default async function GiftCardPage() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";

  return <GiftCardClient initialLanguage={language} />;
}
