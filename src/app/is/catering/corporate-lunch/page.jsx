// Icelandic wrapper for /catering/corporate-lunch.
import CorporateLunchRoute, { generateMetadata } from "../../../catering/corporate-lunch/page.jsx";

export { generateMetadata };

export default function Page(props) {
  return <CorporateLunchRoute {...props} />;
}
