import BookTableForm from "./BookTableForm";
import { getLocaleFromHeaders } from "@/lib/seo";

/**
 * The new booking page, at /restaurant/book.
 *
 * It sits at its own path on purpose. /restaurant/book-table still redirects
 * to Dineout and keeps doing so until cut-over, so this can be built, tried
 * and corrected without a guest ever landing on a half-finished form. At
 * cut-over the old path points here instead and every Book a table button on
 * the site follows.
 *
 * Not in the sitemap and not indexed while that is true.
 */
export const metadata = {
  title: "Book a table | Mama Reykjavik",
  robots: { index: false, follow: false },
};

export default async function BookPage() {
  const language = await getLocaleFromHeaders();
  return <BookTableForm language={language === "is" ? "is" : "en"} />;
}
