// POST /api/admin/subscribers/update
// Manage one subscriber from the dashboard modal.
//   body: { email, action: "unsubscribe" | "resubscribe" }
//
// Admin or host session required.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { unsubscribeEverywhere, resubscribeEverywhere } from "@/lib/subscribers";

export const dynamic = "force-dynamic";

function isAdminOrHost(session) {
  return (
    session &&
    session.user &&
    (session.user.role === "admin" || session.user.role === "host")
  );
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!isAdminOrHost(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const action = body.action;
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  try {
    if (action === "unsubscribe") {
      const r = await unsubscribeEverywhere({ email, source: "admin" });
      return NextResponse.json({ ok: true, ...r });
    }
    if (action === "resubscribe") {
      const r = await resubscribeEverywhere({ email });
      return NextResponse.json({ ok: r.ok, ...r });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[subscribers/update] failed", err?.message || err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
