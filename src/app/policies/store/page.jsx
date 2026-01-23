import StoreContent from "./StoreContent";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

const LAST_UPDATED = "November 12, 2025";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/policies/store";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "Mama Store – Terms & Conditions",
      description:
        "Learn about ordering, payments, shipping, returns, and customer support for Mama Store. Updated November 12, 2025.",
    },
    is: {
      title: "Mama Store – Skilmálar og skilyrði",
      description:
        "Kynntu þér pöntun, greiðslur, sendingar, skil og þjónustu við viðskiptavini hjá Mama Store. Síðast uppfært 12. nóvember 2025.",
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
    openGraph: {
      title: t.title,
      description: t.description,
      url: alternates.canonical,
      type: "website",
      locale: ogLocale(language),
    },
  };
}

export default function StorePolicyPage() {
  return <StoreContent lastUpdated={LAST_UPDATED} />;
}
