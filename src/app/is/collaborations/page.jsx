// Icelandic wrapper for /collaborations.
import CollaborationsPage, { generateMetadata } from "../../collaborations/page.jsx";

export { generateMetadata };

export default function Page(props) {
  return <CollaborationsPage {...props} />;
}
