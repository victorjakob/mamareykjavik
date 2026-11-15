import ManageBooking from "./ManageBooking";

/**
 * A guest's own booking, opened from the link in their confirmation email.
 *
 * noindex, and no sitemap entry: the token in the URL is the key to one
 * person's booking and has no business in a search engine's crawl.
 */
export const metadata = {
  title: "Your booking | Mama Reykjavik",
  robots: { index: false, follow: false },
};

export default async function BookingTokenPage({ params }) {
  const { token } = await params;
  return <ManageBooking token={token} />;
}
