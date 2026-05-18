// /private-session/admin/bookings/[id] — booking detail.
// This is the URL every notification email links to.

import { notFound } from "next/navigation";
import Link from "next/link";

import { getBooking } from "@/app/private-session/_lib/admin-data";
import BookingDetailClient from "./BookingDetailClient";

export const dynamic = "force-dynamic";

export default async function Page({ params }) {
  const { id } = await params;
  const booking = await getBooking(id);
  if (!booking) notFound();
  return <BookingDetailClient booking={booking} />;
}
