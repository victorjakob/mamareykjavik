import CateringQuoteForm from "@/app/components/catering/CateringQuoteForm";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/catering/quote";

  const translations = {
    en: {
      title: "Request a Catering Quote | Mama Reykjavík",
      description:
        "Request a corporate lunch catering quote from Mama Reykjavík. Choose your plant-based dishes, set portions, and we'll come back to you within 24 hours.",
      ogTitle: "Request a Catering Quote — Mama Reykjavík",
      ogDescription:
        "Choose your plant-based dishes, set portions, and we'll come back to you within 24 hours.",
    },
    is: {
      title: "Biddu um veislutilboð | Mama Reykjavík",
      description:
        "Biddu um veislutilboð frá Mama Reykjavík. Veldu plöntubundna rétti, settu skammta og við svörum innan 24 klst.",
      ogTitle: "Biddu um veislutilboð — Mama Reykjavík",
      ogDescription:
        "Veldu plöntubundna rétti, settu skammta og við svörum innan 24 klst.",
    },
  };

  const t = translations[language];
  const formatted = formatMetadata({ title: t.title, description: t.description });
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  return {
    title: formatted.title,
    description: formatted.description,
    alternates,
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: alternates.canonical,
      type: "website",
      locale: ogLocale(language),
    },
  };
}

export default function CateringQuotePage() {
  return <CateringQuoteForm />;
}
