import EventPage from "../../../events/[slug]/page.jsx";
export { generateMetadata, viewport } from "../../../events/[slug]/page.jsx";

export default function Page(props) {
  return <EventPage {...props} />;
}

