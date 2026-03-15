import TakeAwayPage from "../../take-away/page.jsx";
export { generateMetadata } from "../../take-away/page.jsx";

export const revalidate = 300;

export default function Page(props) {
  return <TakeAwayPage {...props} />;
}
