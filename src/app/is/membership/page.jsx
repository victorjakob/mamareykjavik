// Icelandic wrapper for /membership. The English page is already
// locale-aware (reads `x-locale` via generateMetadata and useLanguage),
// so we just re-export it here.
import MembershipLandingPage, { generateMetadata } from "../../membership/page.jsx";

export { generateMetadata };

export default function Page(props) {
  return <MembershipLandingPage {...props} />;
}
