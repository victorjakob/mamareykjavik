import { redirect } from "next/navigation";

/** Adventures / trips are not offered in the UI; keep route from bookmarks. */
export default function MyTripsPage() {
  redirect("/profile");
}
