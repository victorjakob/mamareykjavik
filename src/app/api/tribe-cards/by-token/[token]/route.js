// GET /api/tribe-cards/by-token/[token]
// Public. Anyone with the link can view the card (per product decision).

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";

export async function GET(req, { params }) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { data: card, error } = await supabase
      .from("tribe_cards")
      .select(
        "id, holder_name, holder_email, discount_percent, duration_type, issued_at, expires_at, status, source",
      )
      .eq("access_token", token)
      .single();

    if (error || !card) {
      return NextResponse.json(
        { error: "Card not found or invalid token" },
        { status: 404 },
      );
    }

    // Soft-expiry: if the card's expires_at is in the past, reflect that
    // in the response even if the row hasn't been flipped yet (daily cron
    // will catch up, but we don't want to show "Active" on an expired card).
    const derivedStatus =
      card.status === "active" &&
      card.expires_at &&
      new Date(card.expires_at) < new Date()
        ? "expired"
        : card.status;

    return NextResponse.json({ card: { ...card, status: derivedStatus } });
  } catch (error) {
    console.error("tribe by-token error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
