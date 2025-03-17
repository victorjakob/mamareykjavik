import ListCategories from "./ListCategories";
import { supabase } from "@/util/supabase/client";

export const revalidate = 300; // Revalidate every 60 seconds

export const metadata = {
  title: "Shop | Mama Reykjavik",
  description:
    "Shop our curated collection of sustainable and conscious products at Mama Reykjavik.",
  canonical: "https://mama.is/shop",
  openGraph: {
    title: "Shop at Mama Reykjavik",
    description:
      "Discover our thoughtfully selected collection of sustainable products, clothing, and accessories.",
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
