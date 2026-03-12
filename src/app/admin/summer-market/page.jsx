import AdminGuard from "../AdminGuard";
import SummerMarketAdminPageClient from "./summer-market-admin-page-client";

export const metadata = {
  title: "Summer Market | Admin Dashboard",
  description: "Manage White Lotus Summer Market vendor applications",
};

export default function AdminSummerMarketPage() {
  return (
    <AdminGuard>
      <SummerMarketAdminPageClient />
    </AdminGuard>
  );
}
