import { cookies } from "next/headers";
import BuyPageClient from "./BuyPageClient";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";

  const translations = {
    en: {
      title: "Buy 5 Meals for Winter | Mama Reykjavik",
      description:
        "Complete your purchase of 5 soul-warming meals for 14,900 kr. Secure checkout. Card instantly added to your account.",
    },
    is: {
      title: "Kaupa 5 Réttir Fyrir Veturinn | Mama Reykjavík",
      description:
        "Kláraðu kaupin á 5 sálvarmandi réttum á 14.900 kr. Öruggt greiðsluferli. Kortið bætist strax við reikninginn þinn.",
    },
  };

  const t = translations[language];
  const ogImage =
    "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1762502519/Screenshot_2025-11-07_at_15.00.51_lfef1n.png";

  return {
    title: t.title,
    description: t.description,

    openGraph: {
      title: t.title,
      description: t.description,
      url: "https://mama.is/5/buy",
      siteName: "Mama Reykjavik",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "5 Meals for Winter - Checkout at Mama Reykjavik",
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
    },

    robots: {
      index: false, // Don't index checkout pages
      follow: true,
    },
  };
}

export default function BuyPage() {
  return <BuyPageClient />;
}
