import ShopPage from "../../shop/page.jsx";
export { generateMetadata } from "../../shop/page.jsx";

export const revalidate = 300;

export default function Page(props) {
  return <ShopPage {...props} />;
}

