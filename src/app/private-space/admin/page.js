// /private-space/admin — admin queue.
// Server-rendered list of all bookings; client component handles approve/decline.

import { redirect } from "next/navigation";
import { isAdmin } from "@/util/getRole";
import { createServerSupabase } from "@/util/supabase/server";
import AdminQueue from "./AdminQueue";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Private Space · Admin",
  robots: { index: false, follow: false },
};

export default async function Page() {
  if (!(await isAdmin())) redirect("/");

  const supabase = createServerSupabase();
  const { data: bookings, error } = await supabase
    .from("private_space_bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return <div className="p-8 text-red-500">Failed to load bookings: {error.message}</div>;
  }

  return <AdminQueue bookings={bookings || []} />;
}
