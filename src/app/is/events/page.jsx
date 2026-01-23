import EventsPage from "../../events/page.jsx";
export { generateMetadata } from "../../events/page.jsx";

export const revalidate = 300;

export default function Page(props) {
  return <EventsPage {...props} />;
}

