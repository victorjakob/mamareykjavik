// Icelandic wrapper for /summer-market.
import SummerMarketPage, { generateMetadata } from "../../summer-market/page.jsx";

export { generateMetadata };

export default function Page(props) {
  return <SummerMarketPage {...props} />;
}
