// Apple Wallet web service — debug log endpoint.
//
// POST /v1/log
// Body: { logs: ["..."] }
//
// Apple sends free-form diagnostic strings here when the wallet client
// hits trouble. Useful when something's broken (e.g. cert expiry, bad
// pass JSON) and we want to see what Apple's seeing. We just echo to
// our server logs — production volume is tiny.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const logs = Array.isArray(body?.logs) ? body.logs : [];
    for (const line of logs) {
      console.log("[walletWS apple log]", String(line).slice(0, 500));
    }
  } catch {
    // Apple may post non-JSON in edge cases — swallow and 200 anyway.
  }
  return new NextResponse(null, { status: 200 });
}
