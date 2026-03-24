import { redirect } from "next/navigation";

export default function StatisticsPage() {
  redirect("/admin/manage-events/statistics/hosts");
}
