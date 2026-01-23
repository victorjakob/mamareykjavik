import CategoryPage from "../../../shop/[category]/page.jsx";
export { generateMetadata } from "../../../shop/[category]/page.jsx";

export const dynamic = "force-dynamic";

export default function Page(props) {
  return <CategoryPage {...props} />;
}

