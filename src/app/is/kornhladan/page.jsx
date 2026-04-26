// Icelandic wrapper for /kornhladan.
// Locale is detected from the x-locale header set by src/proxy.js,
// so this just re-exports the EN page and its generateMetadata.
import Kornhladan, { generateMetadata } from "../../kornhladan/page";

export { generateMetadata };

export default function Page(props) {
  return <Kornhladan {...props} />;
}
