// This diagnostic route has been retired.
// Confirmed 2026-04-20:
//   - Auth: Basic base64(privateKey:)   → SALTPAY_RPG_AUTH_MODE=basic_private_colon
//   - Amount: minor units (200000 for 2000 ISK)
//   - Currency: ISO 4217 numeric code as string ("352" for ISK)
// Safe to delete this folder entirely. Returns 410 Gone in the meantime.
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({ error: "Diagnostic route retired." }, { status: 410 });
}
