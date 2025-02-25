import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import ListSingleProduct from "@/app/components/Shop/ListSingleProduct";

export default async function ProductPage({ params }) {
  const supabase = createServerComponentClient({ cookies });

  const { data: product, error } = await supabase
    .from("products")
    .select()
    .eq("slug", params.slug)
    .single();

  if (error) {
    throw error;
  }

  return <ListSingleProduct initialProduct={product} />;
}
