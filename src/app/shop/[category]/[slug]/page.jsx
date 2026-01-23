export const dynamic = "force-dynamic";

import { createServerSupabase } from "@/util/supabase/server";
import ListSingleProduct from "./ListSingleProduct";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata({ params }) {
  const { category, slug } = await params;
  const language = await getLocaleFromHeaders();
  const pathname = `/shop/${category}/${slug}`;
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  try {
    const supabase = await createServerSupabase();
    const { data: product } = await supabase
      .from("products")
      .select("name, description, image")
      .eq("slug", slug)
      .single();

    const name = product?.name || String(slug || "");
    const description =
      product?.description ||
      (language === "is"
        ? "Skoðaðu vöruupplýsingar í netverslun Mama."
        : "View product details in the Mama shop.");

    const titlePrefix = language === "is" ? "Vara" : "Product";

    const formatted = formatMetadata({
      title: `${name} | ${titlePrefix} | Mama`,
      description,
    });

    return {
      title: formatted.title,
      description: formatted.description,
      alternates,
      openGraph: {
        title: `${name} | Mama`,
        description,
        url: alternates.canonical,
        type: "product",
        locale: ogLocale(language),
        images: product?.image ? [{ url: product.image, alt: name }] : undefined,
      },
    };
  } catch {
    return {
      title: language === "is" ? "Vara | Mama" : "Product | Mama",
      alternates,
    };
  }
}

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
