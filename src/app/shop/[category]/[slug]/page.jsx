export const dynamic = "force-dynamic";

import { createServerSupabase } from "@/util/supabase/server";
import ListSingleProduct from "@/app/shop/[category]/[slug]/ListSingleProduct";

export default async function ProductPage({ params }) {
  const supabase = createServerSupabase();

  const { data: product, error } = await supabase
    .from("products")
    .select()
    .eq("slug", params.slug)
    .single();

  if (error) {
    throw error;
  }

  return (
    <div className="pt-40">
      <ListSingleProduct initialProduct={product} />
    </div>
  );
}
