export const dynamic = "force-dynamic";

import { getCategoryAndProducts } from "./data";
import ListProducts from "./ListProducts";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata({ params }) {
  const { category } = await params;
  const language = await getLocaleFromHeaders();
  const pathname = `/shop/${category}`;
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const categoryLabel = String(category || "")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const translations = {
    en: {
      title: `${categoryLabel} | Shop | Mama Reykjavik`,
      description: `Browse ${categoryLabel} in the Mama shop.`,
    },
    is: {
      title: `${categoryLabel} | Verslun | Mama Reykjavík`,
      description: `Skoðaðu ${categoryLabel} í netverslun Mama.`,
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

export default async function CategoryPage({ params }) {
  const { category } = await params; // ✅ await the `params` object directly
  const { products, categorySlug } = await getCategoryAndProducts(category);

  return (
    <div className="pt-40">
      <ListProducts products={products} category={categorySlug} />
    </div>
  );
}
