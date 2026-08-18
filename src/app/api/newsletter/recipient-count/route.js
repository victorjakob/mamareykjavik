// GET /api/newsletter/recipient-count
// -----------------------------------------------------------------------------
// How many people the weekly letter would reach if you sent it right now.
//
// Shown in the send confirmation before an irreversible action, so it reads
// from the same master list the Resend audience is mirrored from
// (newsletter_subscribers, status = 'subscribed'). Anyone who unsubscribed is
// excluded by that status.
//
// Admin or host session required.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (role !== "admin" && role !== "host") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabase();
  const { count, error } = await supabase
    .from("newsletter_subscribers")
    .select("id", { count: "exact", head: true })
    .eq("status", "subscribed");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ count: count ?? 0 });
}
