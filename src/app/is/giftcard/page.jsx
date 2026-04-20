// Icelandic wrapper for /giftcard.
import GiftCardPage, { generateMetadata } from "../../giftcard/page.jsx";

export { generateMetadata };

export default function Page(props) {
  return <GiftCardPage {...props} />;
}
