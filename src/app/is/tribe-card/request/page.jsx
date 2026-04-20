// Icelandic wrapper for /tribe-card/request. The English page reads locale
// from `x-locale` and renders Icelandic copy automatically.
import TribeCardRequestPage, { generateMetadata } from "../../../tribe-card/request/page.jsx";

export { generateMetadata };

export default function Page(props) {
  return <TribeCardRequestPage {...props} />;
}
