import { cookies } from "next/headers";
import BuyPageClient from "./BuyPageClient";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";

  const translations = {
    en: {
      title: "Buy 5 Meals for Winter | Mama Reykjavik",
      description: "Complete your purchase of 5 soul-warming meals for 14,900 kr. Secure checkout. Card instantly added to your account.",
    },
    is: {
      title: "Kaupa 5 Réttir Fyrir Veturinn | Mama Reykjavík",
      description: "Kláraðu kaupin á 5 sálvarmandi réttum á 14.900 kr. Öruggt greiðsluferli. Kortið bætist strax við reikninginn þinn.",
    },
  };

  const t = translations[language];

  return {
    title: t.title,
    description: t.description,
    robots: {
      index: false, // Don't index checkout pages
      follow: true,
    },
  };
}

export default function BuyPage() {
  return <BuyPageClient />;
}

