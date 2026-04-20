// Icelandic wrapper for /tribe-card/[token]. The English page reads locale
// from `x-locale` and returns Icelandic metadata + copy automatically.
import TribeCardTokenPage, { generateMetadata } from "../../../tribe-card/[token]/page.jsx";

export { generateMetadata };

export default function Page(props) {
  return <TribeCardTokenPage {...props} />;
}
