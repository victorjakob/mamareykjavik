import { createServerSupabaseComponent } from "@/util/supabase/serverComponent";

export async function getCategoryAndProducts(slug) {
  const supabase = await createServerSupabaseComponent();

  const { data: categoryData, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .single();

  if (categoryError) {
    throw categoryError;
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryData.id)
    .order("name");

  if (productsError) {
    throw productsError;
  }

  return {
    products,
    categorySlug: slug,
  };
}
