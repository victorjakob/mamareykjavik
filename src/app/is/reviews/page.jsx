import ReviewsPage from "../../reviews/page.jsx";
export { generateMetadata } from "../../reviews/page.jsx";

export const revalidate = 300;

export default function Page(props) {
  return <ReviewsPage {...props} />;
}
