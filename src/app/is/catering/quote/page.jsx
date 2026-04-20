// Icelandic wrapper for /catering/quote.
import CateringQuotePage, { generateMetadata } from "../../../catering/quote/page.jsx";

export { generateMetadata };

export default function Page(props) {
  return <CateringQuotePage {...props} />;
}
