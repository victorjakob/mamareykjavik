// POST /api/admin/subscribers/reconcile
// Sweep every Resend audience (+ local records) for opt-outs and honour them
// everywhere: master list, audit log, and the sending audience.
//   body: { mode: "preview" | "commit" }   (default: "preview")
//
// Admin or host session required.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { reconcileUnsubscribes } from "@/lib/subscribers";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
    body = {};
  }
  const commit = body.mode === "commit";

  try {
    const result = await reconcileUnsubscribes({ commit });
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    console.error("[subscribers/reconcile] failed", err?.message || err);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 },
    );
  }
}
