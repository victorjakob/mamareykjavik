// POST /api/tribe-cards/request
// Public endpoint. Receives a submission from /tribe-card/request form,
// inserts a row in tribe_card_requests, and notifies team@mama.is.
//
// Simple rate-protection: same email can only submit a pending request once
// (if there's already a pending one, we don't create a duplicate — we just
// return ok so the submitter sees the success UI, without leaking existence).

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServerSupabase } from "@/util/supabase/server";
import { buildNewRequestEmail } from "@/lib/tribeCardEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mama.is";

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const phone = (body.phone || "").trim() || null;
    const message = (body.message || "").trim() || null;

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // If the holder already has an active tribe card, short-circuit.
    const { data: existingCard } = await supabase
      .from("tribe_cards")
      .select("id,status")
      .eq("holder_email", email)
      .maybeSingle();

    if (existingCard && existingCard.status === "active") {
      return NextResponse.json(
        { ok: true, alreadyHasCard: true },
        { status: 200 },
      );
    }

    // De-dupe: if a pending request already exists for this email, skip insert.
    const { data: existingReq } = await supabase
      .from("tribe_card_requests")
      .select("id,status")
      .eq("email", email)
      .eq("status", "pending")
      .maybeSingle();

    let requestRow = existingReq;
    if (!existingReq) {
      const { data: inserted, error: insertError } = await supabase
        .from("tribe_card_requests")
        .insert({ name, email, phone, message, status: "pending" })
        .select("*")
        .single();

      if (insertError) {
        console.error("tribe_card_requests insert error:", insertError);
        return NextResponse.json(
          { error: "Something went wrong saving your request." },
          { status: 500 },
        );
      }
      requestRow = inserted;
    }

    // Notify team@mama.is — non-fatal if email fails.
    try {
      const adminUrl = `${SITE_URL}/admin/cards/tribe-cards?request=${requestRow.id}`;
      const { text, html } = buildNewRequestEmail({
        request: { name, email, phone, message },
        adminUrl,
      });

      await resend.emails.send({
        from: "Mama.is <team@mama.is>",
        to: "team@mama.is",
        replyTo: email,
        subject: `Tribe Card request from ${name}`,
        text,
        html,
      });
    } catch (emailError) {
      console.error("Failed to send tribe request notification:", emailError);
      // Continue — request is saved, admin can still see it in the dashboard.
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("tribe request error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
