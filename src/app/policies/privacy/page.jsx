import PrivacyContent from "./PrivacyContent";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/policies/privacy";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "Privacy Policy | Mama Reykjavik",
      description:
        "Understand how Mama Reykjavik & White Lotus collects, uses, and protects your personal information, cookies, and data rights.",
    },
    is: {
      title: "Persónuverndarstefna | Mama Reykjavík",
      description:
        "Kynntu þér hvernig Mama Reykjavík & White Lotus safnar, notar og verndar persónuupplýsingar, vafrakökur og réttindi þín.",
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

const LAST_UPDATED = "November 12, 2025";

export default function PrivacyPolicyPage() {
  return <PrivacyContent lastUpdated={LAST_UPDATED} />;
}