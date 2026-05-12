import BookingPage from "./BookingPage";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";
import { PRIVATE_SPACE_BANNER_OG } from "@/lib/images";
import { getPrivateSpaceRobots } from "@/lib/private-space/config";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/private-space/book";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "Book The Private Space | Mama Reykjavik",
      description:
        "Reserve your time in The Private Space. Pick a date, choose hourly, half-day, full-day, or a recurring weekly slot. We reply within 24 hours.",
    },
    is: {
      title: "Bóka Einkarýmið | Mama Reykjavík",
      description:
        "Frátaktu þinn tíma í Einkarýminu. Veldu dagsetningu, tímabreytt, hálfan eða heilan dag, eða vikulegan tíma. Við svörum innan 24 klst.",
    },
  };

  const t = translations[language] || translations.en;
  const formatted = formatMetadata({ title: t.title, description: t.description });

  return {
    title: formatted.title,
    description: formatted.description,
    alternates,
    openGraph: {
      title: t.title,
      description: t.description,
      url: alternates.canonical,
      images: [{ url: PRIVATE_SPACE_BANNER_OG, width: 1200, height: 630, alt: "Book The Private Space" }],
      type: "website",
      locale: ogLocale(language),
    },
    robots: getPrivateSpaceRobots(),
  };
}

export default async function Page() {
  const language = await getLocaleFromHeaders();
  return <BookingPage locale={language} />;
}
