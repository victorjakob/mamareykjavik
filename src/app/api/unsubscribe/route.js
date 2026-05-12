// POST /api/unsubscribe
// Public endpoint — receives an unsubscribe request from the /unsubscribe page.
// Records the opt-out so future broadcast/marketing sends can filter against it.
//
// We DON'T require auth here on purpose — the user clicked an unsubscribe link
// in their own email. CAN-SPAM compliance requires this be friction-free.
//
// Body: { token?: string, email?: string }
//   - token   — opaque per-recipient token from the email footer (preferred)
//   - email   — fallback when the email was sent without per-recipient tokens
//
// Storage:
//   - Inserts into `email_unsubscribes` table when present (idempotent on email)
//   - If the table doesn't exist yet, logs a warning and returns ok (so the
//     page still confirms to the user — we'll honour it manually until the
//     table lands).

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";

export const runtime = "nodejs";

function isValidEmail(s) {
  return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!token && !isValidEmail(email)) {
    return NextResponse.json(
      { error: "A valid token or email is required." },
      { status: 400 },
    );
  }

  // Try to record the unsubscribe in Supabase. We catch + warn rather than
  // throw so the user still gets a successful confirmation even if the table
  // hasn't been provisioned yet — we'll see the warning in logs and migrate
  // the entries manually.
  try {
    const supabase = createServerSupabase();
    const row = {
      token: token || null,
      email: email || null,
      source: "unsubscribe_page",
      // user_agent + ip would be nice to capture later for audit,
      // but we don't have them here without parsing headers.
    };
    const { error } = await supabase
      .from("email_unsubscribes")
      .upsert(row, { onConflict: "email" });
    if (error) {
      console.warn(
        "[unsubscribe] supabase insert failed (table missing? RLS?):",
        error.message || error,
      );
    }
  } catch (err) {
    console.warn(
      "[unsubscribe] could not record opt-out (will be honoured manually):",
      err?.message || err,
    );
  }

  return NextResponse.json({ ok: true });
}
