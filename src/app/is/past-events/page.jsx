import PastEventsPage from "../../past-events/page.jsx";
export { generateMetadata } from "../../past-events/page.jsx";

export const revalidate = 300;

export default function Page(props) {
  return <PastEventsPage {...props} />;
}
