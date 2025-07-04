export const dynamic = "force-dynamic";

import { getCategoryAndProducts } from "./data";
import ListProducts from "./ListProducts";

export default async function CategoryPage({ params }) {
  const { category } = await params; // ✅ await the `params` object directly
  const { products, categorySlug } = await getCategoryAndProducts(category);

  return (
    <div className="pt-40">
      <ListProducts products={products} category={categorySlug} />
    </div>
  );
}
