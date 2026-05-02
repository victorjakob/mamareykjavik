import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Verifies the current request comes from an admin.
 * Returns either the session (if admin) or a NextResponse to early-return.
 *
 * Usage:
 *   const guard = await requireAdmin();
 *   if (guard instanceof NextResponse) return guard;
 *   // …carry on, guard.user is the admin
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

/** Convenience: 400 with a consistent shape. */
export function badRequest(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/** Convenience: 500 + log. */
export function serverError(error) {
  console.error("[admin/store] API Error:", error);
  return NextResponse.json(
    { error: error?.message || "Internal Server Error" },
    { status: 500 }
  );
}
