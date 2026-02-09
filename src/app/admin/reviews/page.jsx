import AdminGuard from "../AdminGuard";
import ReviewsPageClient from "./reviews-page-client";

export const metadata = {
  title: "Reviews | Admin Dashboard",
  description: "View White Lotus review submissions",
};

export default async function AdminReviewsPage() {
  return (
    <AdminGuard>
      <ReviewsPageClient initialReviews={[]} />
    </AdminGuard>
  );
}

