import ProductPage from "../../../../shop/[category]/[slug]/page.jsx";
export { generateMetadata } from "../../../../shop/[category]/[slug]/page.jsx";

export const dynamic = "force-dynamic";

export default function Page(props) {
  return <ProductPage {...props} />;
}

