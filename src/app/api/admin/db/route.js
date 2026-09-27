// POST /api/admin/db — admin-only query runner for lib/api/adminDbClient.js.
// Body: { table, calls: [[method, args], ...] }. Limited to the tables listed.
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { requireAdminSession } from "@/lib/api/session";

export const dynamic = "force-dynamic";

const TABLES = new Set(["menu_categories", "menu_items"]);
const METHODS = new Set([
  "select", "insert", "update", "upsert", "delete",
  "eq", "neq", "gt", "gte", "lt", "lte", "is", "in", "match", "not", "or",
  "order", "limit", "range", "single", "maybeSingle",
]);

export async function POST(req) {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) {
    return NextResponse.json({ data: null, error: { message: "Unauthorized" } }, { status: 401 });
  }
  const { table, calls } = await req.json().catch(() => ({}));
  if (!TABLES.has(table) || !Array.isArray(calls)) {
    return NextResponse.json({ data: null, error: { message: "Not allowed" } }, { status: 403 });
  }
  try {
    let q = createServerSupabase().from(table);
    for (const [method, args] of calls) {
      if (!METHODS.has(method) || !Array.isArray(args)) throw new Error(`Method not allowed: ${method}`);
      q = q[method](...args);
    }
    const { data, error, count } = await q;
    return NextResponse.json({ data: data ?? null, error: error ?? null, count: count ?? null });
  } catch (err) {
    return NextResponse.json({ data: null, error: { message: err.message } }, { status: 400 });
  }
}
