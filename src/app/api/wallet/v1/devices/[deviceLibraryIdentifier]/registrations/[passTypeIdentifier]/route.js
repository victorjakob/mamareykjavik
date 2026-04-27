// Apple Wallet web service — list serial numbers updated since a given
// timestamp for a specific device.
//
// GET /v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}?passesUpdatedSince=<tag>
//
// Apple calls this after we APNs-ping a device. It expects:
//   200 + JSON { lastUpdated: "<tag>", serialNumbers: ["..."] }  → fetch updates
//   204 No Content                                                → nothing changed
//
// We use tribe_cards.updated_at as the synchronization tag.
//
// No Authorization header on this endpoint per Apple's spec — the
// device-id is the only identifier. Anyone could ping this and learn
// which of the device's known serials were updated, which leaks no
// sensitive info (the actual pass content still requires the pass auth
// token to fetch).

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { deviceLibraryIdentifier, passTypeIdentifier } = await params;
  const url = new URL(req.url);
  const since = url.searchParams.get("passesUpdatedSince");

  if (passTypeIdentifier !== process.env.APPLE_PASS_TYPE_ID) {
    return new NextResponse(null, { status: 404 });
  }

  const supabase = createServerSupabase();

  // Find this device's registered serial numbers.
  const { data: regs, error: regErr } = await supabase
    .from("wallet_pass_registrations")
    .select("serial_number")
    .eq("device_library_identifier", deviceLibraryIdentifier)
    .eq("pass_type_identifier", passTypeIdentifier);

  if (regErr) {
    console.error("[walletWS] list-updates: regs lookup failed:", regErr.message);
    return new NextResponse(null, { status: 500 });
  }
  if (!regs?.length) return new NextResponse(null, { status: 204 });

  // Each serial is "tribe-<uuid>"; extract the UUIDs.
  const cardIds = regs
    .map((r) => r.serial_number)
    .filter((s) => s.startsWith("tribe-"))
    .map((s) => s.slice("tribe-".length));
  if (!cardIds.length) return new NextResponse(null, { status: 204 });

  // Look up cards updated since the given tag (if provided).
  let query = supabase
    .from("tribe_cards")
    .select("id, updated_at")
    .in("id", cardIds);

  // `since` is the value we returned as `lastUpdated` last time.
  // We use updated_at ISO strings as the tag.
  if (since) query = query.gt("updated_at", since);

  const { data: updated, error: updErr } = await query.order("updated_at", { ascending: false });

  if (updErr) {
    console.error("[walletWS] list-updates: cards lookup failed:", updErr.message);
    return new NextResponse(null, { status: 500 });
  }
  if (!updated?.length) return new NextResponse(null, { status: 204 });

  return NextResponse.json({
    lastUpdated: updated[0].updated_at,
    serialNumbers: updated.map((c) => `tribe-${c.id}`),
  });
}
