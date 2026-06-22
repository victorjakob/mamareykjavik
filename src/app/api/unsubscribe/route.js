// POST /api/unsubscribe
// Public endpoint — receives an unsubscribe request from the /unsubscribe page
// (the link in our welcome / transactional email footers carries ?email=).
//
// No auth on purpose: the user clicked an unsubscribe link in their own email.
// CAN-SPAM / GDPR require this be friction-free.
//
// Body: { token?: string, email?: string }
//
// One call now fans out everywhere via unsubscribeEverywhere():
//   - email_unsubscribes  (audit log)
//   - newsletter_subscribers.status = 'unsubscribed'  (master list)
//   - newsletter_welcomes.unsubscribed_at  (so future opt-ins skip)
//   - Resend audience contact marked unsubscribed (so broadcasts exclude them)
//
// We always return ok so the page can confirm to the user even if a downstream
// call hiccups — failures are logged for review.

import { NextResponse } from "next/server";
import { unsubscribeEverywhere } from "@/lib/subscribers";

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
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!token && !isValidEmail(email)) {
    return NextResponse.json(
      { error: "A valid token or email is required." },
      { status: 400 },
    );
  }

  try {
    await unsubscribeEverywhere({ email, token, source: "unsubscribe_page" });
  } catch (err) {
    // Honour it manually if something downstream broke — never block the user.
    console.warn(
      "[unsubscribe] could not fully record opt-out (will honour manually):",
      err?.message || err,
    );
  }

  return NextResponse.json({ ok: true });
}
