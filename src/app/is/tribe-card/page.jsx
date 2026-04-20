// Icelandic wrapper for /tribe-card. The English page is already
// locale-aware (reads `x-locale` via generateMetadata and useLanguage),
// so we just re-export it here.
import TribeCardLandingPage, { generateMetadata } from "../../tribe-card/page.jsx";

export { generateMetadata };

export default function Page(props) {
  return <TribeCardLandingPage {...props} />;
}
