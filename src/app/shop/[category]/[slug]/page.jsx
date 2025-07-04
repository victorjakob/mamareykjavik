export const dynamic = "force-dynamic";

import { createServerSupabase } from "@/util/supabase/server";
import ListSingleProduct from "./ListSingleProduct";

export default async function ProductPage({ params }) {
  const { slug } = await params; // ✅ MUST await params in Next.js 15+

  const supabase = await createServerSupabase(); // ✅ Ensure this is async if using cookies()

  const { data: product, error } = await supabase
    .from("products")
    .select()
    .eq("slug", slug)
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
