// POST /api/private-session/book
//
// STAGE 2 STUB. The real booking/waitlist submit lives in stage 3.
// Returns 501 with a structured payload so the client picker shows a
// "not wired up yet" notice. When stage 3 lands, replace this body with:
//   - validate slot is still available
//   - insert private_session_bookings (or private_session_waitlist)
//   - send confirmation + Mama notification emails
//   - return reference id
//
// Kept inside the /api/private-session/* route prefix per the module boundary.

import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(
      {
        error: "not_implemented",
        message:
          "Booking submission lands in stage 3. The schema and public picker are in place.",
        received_mode: body?.mode || null,
      },
      { status: 501 }
    );
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
