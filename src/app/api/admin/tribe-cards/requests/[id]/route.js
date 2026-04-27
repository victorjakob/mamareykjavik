// PATCH /api/admin/tribe-cards/requests/[id]
// Body: { action: 'approve' | 'reject',
//         discount_percent, duration_type, source?,
//         review_notes?, sendEmail? }
//
// Approve → creates/updates a tribe_cards row linked to this request, sends
//           the welcome email with the card to the holder.
// Reject  → marks the request as rejected. Optionally sends the soft
//           rejection email (sendEmail: true).

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";
import { buildRejectionEmail } from "@/lib/tribeCardEmail";
import { sendTribeWelcomeEmail } from "@/lib/sendTribeWelcomeEmail";
import {
  DURATION_TYPES,
  SOURCES,
  durationToExpiry,
  findUserIdByEmail,
} from "@/lib/tribeCardHelpers";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || "").toLowerCase();
  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const reviewer =
    session.user.email || session.user.name || "admin";
  const reviewedAt = new Date().toISOString();

  const supabase = createServerSupabase();

  const { data: request_row, error: loadErr } = await supabase
    .from("tribe_card_requests")
    .select("*")
    .eq("id", id)
    .single();
  if (loadErr || !request_row) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (action === "approve") {
    const discount_percent = Number(body.discount_percent);
    const duration_type = String(body.duration_type || "");
    const source = SOURCES.includes(body.source) ? body.source : "legacy";
    const sendEmail = body.sendEmail !== false;

    if (
      !Number.isFinite(discount_percent) ||
      discount_percent <= 0 ||
      discount_percent > 100
    ) {
      return NextResponse.json({ error: "Discount must be 1–100" }, { status: 400 });
    }
    if (!DURATION_TYPES.includes(duration_type)) {
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
    }

    const issued_at = new Date().toISOString();
    const expires_at = durationToExpiry(duration_type, issued_at);
    const user_id = await findUserIdByEmail(supabase, request_row.email);

    const { data: card, error: upsertErr } = await supabase
      .from("tribe_cards")
      .upsert(
        {
          holder_name: request_row.name,
          holder_email: request_row.email,
          holder_phone: request_row.phone,
          discount_percent,
          duration_type,
          issued_at,
          expires_at,
          status: "active",
          source,
          request_id: request_row.id,
          user_id,
        },
        { onConflict: "holder_email" },
      )
      .select("*")
      .single();

    if (upsertErr) {
      console.error("approve upsert error:", upsertErr);
      return NextResponse.json({ error: "Failed to issue card" }, { status: 500 });
    }

    const { error: markErr } = await supabase
      .from("tribe_card_requests")
      .update({
        status: "approved",
        reviewed_by: reviewer,
        reviewed_at: reviewedAt,
        review_notes: body.review_notes || null,
      })
      .eq("id", id);
    if (markErr) console.error("mark approved error:", markErr);

    if (sendEmail) {
      // Sends with an Apple Wallet .pkpass attached when env vars are set;
      // gracefully degrades to plain HTML email otherwise.
      await sendTribeWelcomeEmail(card);
    }

    return NextResponse.json({ ok: true, card });
  }

  // ─── action === 'reject' ─────────────────────────────────────────────────
  const sendEmail = body.sendEmail === true; // opt-in for reject
  const { error: markErr } = await supabase
    .from("tribe_card_requests")
    .update({
      status: "rejected",
      reviewed_by: reviewer,
      reviewed_at: reviewedAt,
      review_notes: body.review_notes || null,
    })
    .eq("id", id);
  if (markErr) {
    console.error("reject mark error:", markErr);
    return NextResponse.json({ error: "Failed to reject" }, { status: 500 });
  }

  if (sendEmail) {
    try {
      const { text, html } = buildRejectionEmail({
        holder_name: request_row.name,
        reviewNotes: body.review_notes || "",
      });
      await resend.emails.send({
        from: "Mama.is <team@mama.is>",
        to: request_row.email,
        subject: "Regarding your Tribe Card request",
        text,
        html,
      });
    } catch (emailError) {
      console.error("reject email error:", emailError);
    }
  }

  return NextResponse.json({ ok: true });
}
