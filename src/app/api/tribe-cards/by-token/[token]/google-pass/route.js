// GET /api/tribe-cards/by-token/[token]/google-pass
//
// Public endpoint — same access-by-token model as the Apple .pkpass
// download. Returns a JSON body with the "Save to Google Wallet" URL
// for this card. The frontend uses that URL as the href of the
// "Save to Google Wallet" badge button.
//
// We don't redirect server-side — clients want the URL string so they
// can decide how to render it (link vs. button vs. open in new tab).
//
// Response shape:
//   200 → { saveUrl: "https://pay.google.com/gp/v/save/..." }
//   404 → { error: "Card not found" }
//   500 → { error: "..." }  (Google API call failed, e.g. issuer not set up yet)

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { buildGoogleWalletSaveUrl } from "@/lib/googleWallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { data: card, error } = await supabase
      .from("tribe_cards")
      .select("*")
      .eq("access_token", token)
      .single();

    if (error || !card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const saveUrl = await buildGoogleWalletSaveUrl(card);
    return NextResponse.json({ saveUrl });
  } catch (err) {
    console.error("[google-pass] failed:", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Failed to build Google Wallet URL" },
      { status: 500 },
    );
  }
}
