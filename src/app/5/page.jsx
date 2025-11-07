import { cookies } from "next/headers";
import FiveMealOfferClient from "./FiveMealOfferClient";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";

  const translations = {
    en: {
      title: "5 Meals For Winter | Mama Reykjavik",
      description:
        "72-hour flash sale: 5 soul-warming mains for 14,900 kr (was 21,150 kr). Valid Dec 2025 - May 2026. Gift it with one tap!",
    },
    is: {
      title: "5 Réttir Fyrir Veturinn | Mama Reykjavík",
      description:
        "72 klst blitz: 5 sálvarmandi aðalréttir á 14.900 kr (var 21.150 kr). Gilt des 2025 - maí 2026. Gjafir með einum smelli!",
    },
  };

  const t = translations[language];

  return {
    title: t.title,
    description: t.description,
    canonical: "https://mama.is/5",
    openGraph: {
      title: t.title,
      description: t.description,
      url: "https://mama.is/5",
      type: "website",
    },
  };
}

export default async function FiveMealOffer() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";

  return <FiveMealOfferClient initialLanguage={language} />;
}
