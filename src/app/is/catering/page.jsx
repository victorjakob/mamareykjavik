// Icelandic wrapper for /catering. The English page reads locale from
// `x-locale` and renders Icelandic copy automatically.
import CateringRoute, { generateMetadata } from "../../catering/page.jsx";

export { generateMetadata };

export default function Page(props) {
  return <CateringRoute {...props} />;
}
