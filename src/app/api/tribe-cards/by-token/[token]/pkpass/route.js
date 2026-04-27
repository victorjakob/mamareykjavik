// GET /api/tribe-cards/by-token/[token]/pkpass
//
// Public Apple Wallet pass download. Same access-by-token model as the
// /by-token/[token] JSON endpoint — anyone with the access_token can
// download the .pkpass for that card. Used by:
//   • the "Add to Apple Wallet" button in the welcome email
//   • the "Add to Apple Wallet" button on /tribe-card/[token]
//
// We always look up the card fresh from Supabase before signing, so the
// pass reflects the current expires_at + status. Revoked / expired cards
// still return a pass — but with `voided: true` set, so iOS Wallet shows
// it greyed out (i.e. the user can re-add an expired card and immediately
// see that it's invalid). Returning 404 instead would be misleading.

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { generateTribePass } from "@/lib/applePass";

// Force Node.js runtime — pass signing uses node-forge + filesystem.
export const runtime = "nodejs";

export async function GET(_req, { params }) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { data: card, error } = await supabase
      .from("tribe_cards")
      .select(
        "id, holder_name, holder_email, discount_percent, duration_type, issued_at, expires_at, status, source, access_token, authentication_token",
      )
      .eq("access_token", token)
      .single();

    if (error || !card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const passBuffer = await generateTribePass(card);

    return new NextResponse(passBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="MamaTribeCard.pkpass"`,
        // Don't cache — the underlying card status / expiry can change.
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[tribe pkpass download] failed:", err?.message || err);
    return NextResponse.json(
      { error: "Failed to generate pass" },
      { status: 500 },
    );
  }
}
