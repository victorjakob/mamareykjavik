import ReviewClient from "./ReviewClient";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/review";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });
  const ogImage =
    "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1766576002/wl-cover_yzyuhz.jpg";

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
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "White Lotus venue",
        },
      ],
      type: "website",
      locale: ogLocale(language),
    },
    twitter: {
      card: "summary_large_image",
      title: t.ogTitle,
      description: t.ogDescription,
      images: [ogImage],
    },
  };
}

export default async function ReviewPage() {
  const language = await getLocaleFromHeaders();
  return <ReviewClient locale={language} />;
}

