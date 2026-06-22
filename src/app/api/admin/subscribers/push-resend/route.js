// POST /api/admin/subscribers/push-resend
// Push one batch of not-yet-synced subscribers into the Resend audience.
// Resumable: the dashboard calls this repeatedly until `remaining` is 0.
//   body: { limit?: number }   (default 40)
//
// Admin or host session required.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { pushBatchToResend } from "@/lib/subscribers";

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
  const limit = Math.min(Math.max(Number(body.limit) || 40, 1), 100);

  try {
    const result = await pushBatchToResend({ limit });
    const status = result.ok ? 200 : 500;
    return NextResponse.json(result, { status });
  } catch (err) {
    console.error("[subscribers/push-resend] failed", err?.message || err);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 },
    );
  }
}
