// POST /api/newsletter/send/[draftId]
// Send the draft as a Resend broadcast from the edit page. Admin/host session
// required. Token is NOT required here because we trust the session.
//
// Shares logic with /api/newsletter/approve via @/lib/newsletter-send.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";
import { sendNewsletterBroadcast } from "@/lib/newsletter-send";

function isAdminOrHost(session) {
  return (
    session &&
    session.user &&
    (session.user.role === "admin" || session.user.role === "host")
  );
}

export async function POST(_req, ctx) {
  const session = await getServerSession(authOptions);
  if (!isAdminOrHost(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { draftId } = await ctx.params;
  if (!draftId) {
    return NextResponse.json(
      { error: "Missing draft id" },
      { status: 400 },
    );
  }

  const supabase = createServerSupabase();
  const { data: draft, error: draftError } = await supabase
    .from("newsletter_drafts")
    .select(
      "id, status, subject, html, send_date, resend_broadcast_id",
    )
    .eq("id", draftId)
    .maybeSingle();

  if (draftError || !draft) {
    return NextResponse.json(
      { error: draftError?.message || "Draft not found" },
      { status: 404 },
    );
  }

  const result = await sendNewsletterBroadcast({ draft, supabase });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    broadcastId: result.broadcastId,
  });
}
