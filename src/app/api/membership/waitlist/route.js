// POST /api/membership/waitlist
// -----------------------------------------------------------------------------
// "Notify me" capture for tiers that aren't open yet (today: High Ticket /
// patron). PUBLIC — homepage / membership-page visitors usually aren't signed
// in, so no session is required. We only validate the email shape.
//
// Body:
//   {
//     "email":  "someone@example.com",     // required
//     "name":   "Their Name",              // optional
//     "note":   "free-form interest note", // optional
//     "tier":   "patron",                  // optional, defaults to 'patron'
//     "locale": "en" | "is",               // optional
//     "source": "membership_page"          // optional, where the form lived
//   }
//
// Rate-limit friendly: the insert upserts on (email, tier) and ignores
// duplicates, so repeat submissions are silent no-ops that still return ok.
// The email also joins the newsletter master list (source "waitlist") via the
// shared addToList helper — best effort, never blocks the signup.

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { addToList } from "@/lib/subscribers";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIERS = ["free", "tribe", "patron"];

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));

    const email = String(body?.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 320) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const tier = TIERS.includes(body?.tier) ? body.tier : "patron";
    const name =
      typeof body?.name === "string" ? body.name.trim().slice(0, 200) || null : null;
    const note =
      typeof body?.note === "string" ? body.note.trim().slice(0, 2000) || null : null;
    const locale = body?.locale === "is" ? "is" : "en";
    const source =
      typeof body?.source === "string"
        ? body.source.trim().slice(0, 100) || "membership_page"
        : "membership_page";

    const supabase = createServerSupabase();

    // Idempotent: unique(email, tier) — a repeat signup is a silent no-op.
    const { error: insErr } = await supabase
      .from("membership_waitlist")
      .upsert(
        { email, name, note, tier, locale, source },
        { onConflict: "email,tier", ignoreDuplicates: true },
      );

    if (insErr) {
      console.error("POST /api/membership/waitlist insert failed:", insErr);
      return NextResponse.json(
        { ok: false, error: "Could not save your signup. Please try again." },
        { status: 500 },
      );
    }

    // Waitlisters asked us to write to them — put them on the master list too.
    // Best effort: never fail the signup if the list/Resend call hiccups.
    try {
      await addToList({
        email,
        name,
        source: "waitlist",
        consentBasis: "explicit_optin",
        supabase,
      });
    } catch (err) {
      console.error("waitlist addToList failed:", err?.message || err);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/membership/waitlist failed:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
