// Small helpers for API routes that act on behalf of the signed-in user.
// All database access in these routes uses the service client; who may see
// what is decided here, from the NextAuth session — never from the browser.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

export function jsonError(error, status = 500) {
  if (status >= 500) console.error("[api]", error);
  return NextResponse.json(
    { error: typeof error === "string" ? error : error?.message || "Server error" },
    { status }
  );
}
