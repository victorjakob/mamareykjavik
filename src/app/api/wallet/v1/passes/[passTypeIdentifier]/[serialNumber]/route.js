// Apple Wallet web service — fetch the latest signed .pkpass for a
// given serial number. Apple calls this after we APNs-ping a device
// AND after the device gets a list of updated serials.
//
// GET /v1/passes/{passTypeIdentifier}/{serialNumber}
// Auth: Authorization: ApplePass <tribe_cards.authentication_token>
//
// Honors If-Modified-Since — Apple sends Last-Modified from the
// previous fetch, and we 304 if nothing has changed (saves bandwidth
// and avoids re-signing the same pass repeatedly).

import { NextResponse } from "next/server";
import { authenticateCardRequest } from "@/lib/walletWebService";
import { generateTribePass } from "@/lib/applePass";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { passTypeIdentifier, serialNumber } = await params;

  const auth = await authenticateCardRequest(req, { passTypeIdentifier, serialNumber });
  if (!auth.ok) {
    if (auth.reason === "card-not-found") return new NextResponse(null, { status: 404 });
    return new NextResponse(null, { status: 401 });
  }
  const { card } = auth;

  // If-Modified-Since support — only re-sign if the card actually
  // changed since the device last pulled.
  const ims = req.headers.get("if-modified-since");
  const updatedAt = card.updated_at ? new Date(card.updated_at) : null;
  if (ims && updatedAt) {
    const imsDate = new Date(ims);
    if (!Number.isNaN(imsDate.getTime()) && imsDate >= updatedAt) {
      return new NextResponse(null, { status: 304 });
    }
  }

  let passBuffer;
  try {
    passBuffer = await generateTribePass(card);
  } catch (err) {
    console.error("[walletWS] pass generation failed:", err?.message || err);
    return new NextResponse(null, { status: 500 });
  }

  const headers = {
    "Content-Type": "application/vnd.apple.pkpass",
    "Cache-Control": "no-store",
  };
  if (updatedAt) headers["Last-Modified"] = updatedAt.toUTCString();

  return new NextResponse(passBuffer, { status: 200, headers });
}
