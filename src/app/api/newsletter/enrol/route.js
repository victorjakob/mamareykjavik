// POST /api/newsletter/enrol
// Fire-and-forget endpoint used by client flows (door tickets, free tickets,
// any place a paid SaltPay redirect isn't involved). Calls the shared
// enrolAndWelcome helper so the welcome email and Resend audience update
// happen consistently with the rest of the app.
//
// Body:
//   {
//     "email": "buyer@example.com",
//     "name":  "Buyer Name",
//     "source": "ticket_buyer" | "account_optin",
//     "consentBasis": "soft_optin_customer" | "explicit_optin"
//   }
//
// This route returns 200 quickly even if Resend or Supabase is misbehaving:
// the welcome flow is auxiliary and must never block the customer experience.
// All real errors are logged server-side.

import { NextResponse } from "next/server";
import { enrolAndWelcome } from "@/lib/newsletter";

export async function POST(req) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const name = body.name || "";
    const source = body.source || "ticket_buyer";
    const consentBasis =
      body.consentBasis ||
      (source === "ticket_buyer" ? "soft_optin_customer" : "explicit_optin");

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { ok: false, reason: "invalid_email" },
        { status: 400 },
      );
    }

    // Fire and forget. We do not await the result before responding so the
    // client never waits on Resend latency. Errors are logged inside the
    // helper.
    enrolAndWelcome({ email, name, source, consentBasis }).catch((err) =>
      console.error("[/api/newsletter/enrol] enrolAndWelcome threw", err),
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[/api/newsletter/enrol] failed", err);
    // Still 200 — we never want a network blip here to look broken to the
    // user. Their ticket was already issued by the calling flow.
    return NextResponse.json({ ok: false, reason: "internal" }, { status: 200 });
  }
}
