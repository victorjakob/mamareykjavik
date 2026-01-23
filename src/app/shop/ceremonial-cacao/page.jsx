import Cacao from "@/app/components/Shop/Cacao/Cacao";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/shop/ceremonial-cacao";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "Ceremonial Cacao | Mama Shop",
      description:
        "Explore our ceremonial cacao offerings at Mama Store — learn about cacao and browse products.",
    },
    is: {
      title: "Athafnacacao | Mama Store",
      description:
        "Kannaðu athafnacacao hjá Mama Store — fræðsla um cacao og vörur til að skoða og kaupa.",
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

export default function ShopItem() {
  return (
    <div>
      <Cacao />
    </div>
  );
}
