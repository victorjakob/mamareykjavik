// POST /api/admin/subscribers/import-resend
// Import the current Resend audience into the master list — including everyone
// who already unsubscribed from the manual broadcasts, so they are skipped by
// a later "Add everyone".
//   body: { mode: "preview" | "commit" }   (default: "preview")
//
// Admin or host session required.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { importFromResend } from "@/lib/subscribers";

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
    const result = await importFromResend({ commit });
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    console.error("[subscribers/import-resend] failed", err?.message || err);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 },
    );
  }
}
