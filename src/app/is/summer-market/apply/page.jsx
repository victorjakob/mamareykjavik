// Icelandic wrapper for /summer-market/apply.
import SummerMarketApplyPage, {
  generateMetadata,
} from "../../../summer-market/apply/page.jsx";

export { generateMetadata };

export default function Page(props) {
  return <SummerMarketApplyPage {...props} />;
}
