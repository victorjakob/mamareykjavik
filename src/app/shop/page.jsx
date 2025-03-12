import ListCategories from "../components/Shop/ListCategories";
import { supabase } from "@/util/supabase/client";

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
