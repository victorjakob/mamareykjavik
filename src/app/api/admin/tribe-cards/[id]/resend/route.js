// POST /api/admin/tribe-cards/[id]/resend
// Re-send the Tribe Card email (card visual + Add-to-Wallet buttons +
// .pkpass attachment) to the holder. Admin only. Use it when a member says
// "I never got my card", after fixing an email address, or after a card
// was created by hand.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";
import { sendTribeWelcomeEmail } from "@/lib/sendTribeWelcomeEmail";

export const runtime = "nodejs";

export async function POST(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const supabase = createServerSupabase();
  const { data: card, error } = await supabase.from("tribe_cards").select("*").eq("id", id).single();
  if (error || !card) return NextResponse.json({ error: "Card not found" }, { status: 404 });
  if (card.status !== "active") {
    return NextResponse.json({ error: "Card is not active — reactivate it first." }, { status: 400 });
  }
  const context = card.source === "paid-tribe" ? "membership" : "issued";
  const result = await sendTribeWelcomeEmail(card, { context });
  if (!result.ok) {
    return NextResponse.json({ error: result.error?.message || "Send failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, to: card.holder_email, withWallet: result.withWallet });
}
