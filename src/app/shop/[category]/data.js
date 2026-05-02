import { createServerSupabaseComponent } from "@/util/supabase/serverComponent";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getCategoryAndProducts(slug) {
  const supabase = await createServerSupabaseComponent();
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "admin";

  const { data: categoryData, error: categoryError } = await supabase
    .from("categories")
    .select("id, is_hidden")
    .eq("slug", slug)
    .single();

  if (categoryError) {
    throw categoryError;
  }

  // Hidden categories return empty for the public, so direct links don't leak.
  if (categoryData?.is_hidden && !isAdmin) {
    return { products: [], categorySlug: slug, isAdmin };
  }

  let productsQuery = supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryData.id)
    .order("order", { ascending: true })
    .order("name");

  if (!isAdmin) {
    productsQuery = productsQuery.eq("is_hidden", false);
  }

  const { data: products, error: productsError } = await productsQuery;

  if (productsError) {
    throw productsError;
  }

  return {
    products,
    categorySlug: slug,
    categoryId: categoryData.id,
    isAdmin,
  };
}
