// POST /api/admin/subscribers/sync
// Consolidate every business email into the master list.
//   body: { mode: "preview" | "commit" }   (default: "preview")
//
// "preview" is a dry run — it returns the counts of what *would* change without
// writing anything. "commit" performs the upsert. Anyone already unsubscribed
// is never re-subscribed.
//
// Admin or host session required.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { consolidateSubscribers } from "@/lib/subscribers";

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
    const result = await consolidateSubscribers({ commit });
    if (!result.ok) {
      return NextResponse.json(result, { status: 500 });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("[subscribers/sync] failed", err?.message || err);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 },
    );
  }
}
