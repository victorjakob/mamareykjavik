import ListCategories from "./ListCategories";
import { supabase } from "@/util/supabase/client";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export const revalidate = 300; // Revalidate every 5 minutes

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
          url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/mamabanner.jpg",
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

export default async function Shop() {
  // Fetch categories on the server
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error.message);
    return <div>Error loading categories</div>;
  }

  const filteredCategories = (categories || []).filter(
    (c) =>
      c?.name?.toLowerCase() !== "healthy high" &&
      c?.slug?.toLowerCase() !== "healthy-high"
  );

  // Fetch products for all real categories in parallel
  const categoryIds = filteredCategories.map((c) => c.id);
  let productsByCategory = {};

  if (categoryIds.length > 0) {
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .in("category_id", categoryIds)
      .order("name");

    if (!productsError && products) {
      productsByCategory = products.reduce((acc, p) => {
        const key = p.category_id;
        if (!acc[key]) acc[key] = [];
        acc[key].push(p);
        return acc;
      }, {});
    }
  }

  const GIFT_CARD_CATEGORY = {
    id: "giftcard",
    name: "GiftCard",
    slug: "giftcard",
    image: "/mamaimg/mamalogo.png",
    description: "Give the gift of delicious plant-based meals!",
    _isGiftCard: true,
  };

  // Attach products to each category (empty array for giftcard)
  const categoriesWithProducts = [
    ...filteredCategories.map((c) => ({
      ...c,
      products: productsByCategory[c.id] || [],
    })),
    { ...GIFT_CARD_CATEGORY, products: [] },
  ];

  return <ListCategories categories={categoriesWithProducts} />;
}
