import ListProducts from "@/app/components/Shop/ListProducts";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function CategoryPage({ params }) {
  const supabase = createServerComponentClient({ cookies });

  // Fetch category ID
  const { data: categoryData, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", params.category)
    .single();

  if (categoryError) {
    throw categoryError;
  }

  // Fetch products
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryData.id)
    .order("name");

  if (error) {
    throw error;
  }

  return (
    <div className="pt-40">
      <ListProducts products={products} category={params.category} />
    </div>
  );
}
