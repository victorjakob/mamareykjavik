// Apple Wallet web service — register / unregister a device for pass updates.
//
// POST   = device adds the pass; we store its push token and the
//          (device, serial) registration so future renewal pushes reach it.
// DELETE = device drops the pass; we unregister it.
//
// Auth: Authorization: ApplePass <tribe_cards.authentication_token>
// Spec: https://developer.apple.com/documentation/walletpasses/register_a_pass_for_update_notifications

import { NextResponse } from "next/server";
import { authenticateCardRequest } from "@/lib/walletWebService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } = await params;

  const auth = await authenticateCardRequest(req, { passTypeIdentifier, serialNumber });
  if (!auth.ok) {
    if (auth.reason === "card-not-found") return new NextResponse(null, { status: 404 });
    return new NextResponse(null, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const pushToken = body?.pushToken;
  if (!pushToken) return new NextResponse(null, { status: 400 });

  const { supabase } = auth;

  // Upsert the device — Apple may rotate the push token, overwrite.
  const { error: devErr } = await supabase
    .from("wallet_pass_devices")
    .upsert(
      {
        device_library_identifier: deviceLibraryIdentifier,
        push_token: pushToken,
      },
      { onConflict: "device_library_identifier" },
    );
  if (devErr) {
    console.error("[walletWS] device upsert failed:", devErr.message);
    return new NextResponse(null, { status: 500 });
  }

  // Insert the registration. If it already exists Apple expects 200 OK
  // (not 201) — onConflict do-nothing achieves this.
  const { data: existing } = await supabase
    .from("wallet_pass_registrations")
    .select("id")
    .eq("device_library_identifier", deviceLibraryIdentifier)
    .eq("pass_type_identifier", passTypeIdentifier)
    .eq("serial_number", serialNumber)
    .maybeSingle();

  if (existing) {
    // Already registered — 200 per Apple spec.
    return new NextResponse(null, { status: 200 });
  }

  const { error: regErr } = await supabase
    .from("wallet_pass_registrations")
    .insert({
      device_library_identifier: deviceLibraryIdentifier,
      pass_type_identifier: passTypeIdentifier,
      serial_number: serialNumber,
    });
  if (regErr) {
    console.error("[walletWS] registration insert failed:", regErr.message);
    return new NextResponse(null, { status: 500 });
  }

  // 201 Created on first registration.
  return new NextResponse(null, { status: 201 });
}

export async function DELETE(req, { params }) {
  const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } = await params;

  const auth = await authenticateCardRequest(req, { passTypeIdentifier, serialNumber });
  if (!auth.ok) {
    if (auth.reason === "card-not-found") return new NextResponse(null, { status: 404 });
    return new NextResponse(null, { status: 401 });
  }

  const { supabase } = auth;
  const { error } = await supabase
    .from("wallet_pass_registrations")
    .delete()
    .eq("device_library_identifier", deviceLibraryIdentifier)
    .eq("pass_type_identifier", passTypeIdentifier)
    .eq("serial_number", serialNumber);

  if (error) {
    console.error("[walletWS] unregister failed:", error.message);
    return new NextResponse(null, { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}
