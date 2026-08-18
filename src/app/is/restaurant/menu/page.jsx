import MenuPage from "../../../restaurant/menu/page.jsx";
export { generateMetadata } from "../../../restaurant/menu/page.jsx";

/* Route segment config must be a literal in this file — Next cannot
   statically read a re-exported `revalidate`. Keep in sync with
   src/app/restaurant/menu/page.jsx. */
export const revalidate = 60;

export default function Page(props) {
  return <MenuPage {...props} />;
}
