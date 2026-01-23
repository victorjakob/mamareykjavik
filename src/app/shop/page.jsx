import ListCategories from "./ListCategories";
import { supabase } from "@/util/supabase/client";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export const revalidate = 300; // Revalidate every 60 seconds

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/shop";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "Shop | Mama Reykjavik",
      description:
        "Shop our curated collection of sustainable and conscious products at Mama Reykjavik.",
      ogTitle: "Shop at Mama Reykjavik",
      ogDescription:
        "Discover our thoughtfully selected collection of sustainable products, clothing, and accessories.",
    },
    is: {
      title: "Verslun | Mama Reykjavík",
      description:
        "Verslaðu vandaða safn okkar af sjálfbærum og meðvituðum vörum á Mama Reykjavík.",
      ogTitle: "Verslaðu á Mama Reykjavík",
      ogDescription:
        "Kannaðu vandaða safn okkar af sjálfbærum vörum, fötum og fylgihlutum.",
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
      title: t.ogTitle,
      description: t.ogDescription,
      url: alternates.canonical,
      images: [
        {
          url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1",
          width: 1200,
          height: 630,
          alt: "Mama Reykjavik Shop",
        },
      ],
      type: "website",
      locale: ogLocale(language),
    },
  };
}

// Mark the component as async to enable server-side data fetching
export default async function Shop() {
  // Fetch categories on the server
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error.message);
    // You might want to handle this error appropriately
    return <div>Error loading categories</div>;
  }

  return (
    <div className="pt-40">
      <ListCategories categories={categories} />
    </div>
  );
}
