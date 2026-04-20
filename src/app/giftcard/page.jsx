import { cookies } from "next/headers";
import GiftCardClient from "./GiftCardClient";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/giftcard";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "Gift Card — Mama Reykjavík",
      description:
        "Give the gift of delicious plant-based meals. Choose any amount from 1,000 to 50,000 kr. Available as email, pickup, or mail delivery.",
      keywords:
        "Mama Reykjavik, gift card, vegan food Iceland, plant-based meals, Reykjavik restaurant, gift voucher, sustainable dining",
    },
    is: {
      title: "Gjafakort — Mama Reykjavík",
      description:
        "Gefðu gjöf af ljúffengum plöntubundnum réttum. Veldu hvaða upphæð sem er frá 1.000 til 50.000 kr. Fáanlegt í tölvupósti, til afhendingar eða sent heim.",
      keywords:
        "Mama Reykjavík, gjafakort, vegan matur Ísland, jurtamatur, Reykjavík veitingastaður, gjafabréf, sjálfbær veitingaþjónusta",
    },
  };

  const t = translations[language] || translations.en;
  const formatted = formatMetadata({ title: t.title, description: t.description });

  return {
    title: formatted.title,
    description: formatted.description,
    keywords: t.keywords,
    authors: [{ name: "Mama Reykjavík" }],
    creator: "Mama Reykjavík",
    publisher: "Mama Reykjavík",
    alternates,
    openGraph: {
      title: t.title,
      description: t.description,
      url: alternates.canonical,
      siteName: "Mama Reykjavík",
      images: [
        {
          url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/mamabanner.jpg",
          width: 1200,
          height: 630,
          alt: "Mama Reykjavík — Restaurant & Events",
        },
      ],
      locale: ogLocale(language),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: t.description,
      images: [
        {
          url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/mamabanner.jpg",
          alt: "Mama Reykjavík Logo",
        },
      ],
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
