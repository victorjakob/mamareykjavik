// Retired 2026-09-26. Ticket checkout (pricing, seat reservation, payment
// link and confirmation emails) now lives in POST /api/tickets/checkout,
// where the price is worked out on the server. This route used to trust the
// amount / email content sent by the browser, so it no longer does anything.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "This checkout has moved. Please reload the page and try again." },
    { status: 410 }
  );
}
