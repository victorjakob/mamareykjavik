// Icelandic wrapper for /brand.
import BrandPage, { generateMetadata } from "../../brand/page.jsx";

export { generateMetadata };

export default function Page(props) {
  return <BrandPage {...props} />;
}
