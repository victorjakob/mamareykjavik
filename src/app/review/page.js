import ReviewClient from "./ReviewClient";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/review";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "Quick feedback (30 seconds) | White Lotus",
      description:
        "A short post-event feedback form for White Lotus. Your input helps us refine the space and service.",
      ogTitle: "Quick feedback (30 seconds) | White Lotus",
      ogDescription:
        "Thanks for hosting with White Lotus. Your feedback helps us refine the space and service.",
    },
    is: {
      title: "Stutt endurgjöf (30 sekúndur) | White Lotus",
      description:
        "Stutt endurgjafareyðublað eftir viðburð hjá White Lotus. Endurgjöfin hjálpar okkur að bæta rýmið og þjónustuna.",
      ogTitle: "Stutt endurgjöf (30 sekúndur) | White Lotus",
      ogDescription:
        "Takk fyrir að halda viðburð hjá White Lotus. Endurgjöfin hjálpar okkur að bæta rýmið og þjónustuna.",
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
    alternates,
    robots: { index: false, follow: false },
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: alternates.canonical,
      type: "website",
      locale: ogLocale(language),
    },
  };
}

export default async function ReviewPage() {
  const language = await getLocaleFromHeaders();
  return <ReviewClient locale={language} />;
}

