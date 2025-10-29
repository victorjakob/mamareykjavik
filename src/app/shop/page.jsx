import ListCategories from "./ListCategories";
import { supabase } from "@/util/supabase/client";
import { cookies } from "next/headers";

export const revalidate = 300; // Revalidate every 60 seconds

export async function generateMetadata() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";

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

  return {
    title: t.title,
    description: t.description,
    canonical: "https://mama.is/shop",
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: "https://mama.is/shop",
      images: [
        {
          url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1",
          width: 1200,
          height: 630,
          alt: "Mama Reykjavik Shop",
        },
      ],
      type: "website",
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
