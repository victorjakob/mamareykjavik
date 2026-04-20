import BrandContent from "./BrandContent";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/brand";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "Brand Resources | Mama Reykjavík & White Lotus",
      description:
        "Download official logos and brand assets for Mama Reykjavík and White Lotus Venue. High-quality brand resources for partners and media.",
      ogTitle: "Brand Resources | Mama & White Lotus",
      ogDescription:
        "Download official logos and brand assets for Mama Reykjavík and White Lotus Venue.",
    },
    is: {
      title: "Vörumerkjaefni | Mama Reykjavík & White Lotus",
      description:
        "Sæktu opinber lógó og vörumerkjaefni fyrir Mama Reykjavík og White Lotus. Efni í háum gæðum fyrir samstarfsaðila og fjölmiðla.",
      ogTitle: "Vörumerkjaefni | Mama & White Lotus",
      ogDescription:
        "Sæktu opinber lógó og vörumerkjaefni fyrir Mama Reykjavík og White Lotus.",
    },
  };

  const t = translations[language] || translations.en;
  const formatted = formatMetadata({ title: t.title, description: t.description });

  return {
    title: formatted.title,
    description: formatted.description,
    alternates,
    keywords:
      "Mama Reykjavik brand, logo download, brand assets, White Lotus branding, press kit, media resources Iceland, Mama logo, brand guidelines",
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: alternates.canonical,
      type: "website",
      locale: ogLocale(language),
      images: [
        {
          url: "https://cmqoetecaasivfzxgnxe.supabase.co/storage/v1/object/public/brand/logo-merged.png",
          width: 1200,
          height: 630,
          alt: "Mama Reykjavík & White Lotus Brand Resources",
        },
      ],
    },
  };
}

export default function BrandPage() {
  return <BrandContent />;
}
