// GET /api/admin/subscribers/list?q=&status=&page=
// Paginated, searchable view of the master list for the dashboard table.
//
// Admin or host session required.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

function isAdminOrHost(session) {
  return (
    session &&
    session.user &&
    (session.user.role === "admin" || session.user.role === "host")
  );
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!isAdminOrHost(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const status = (url.searchParams.get("status") || "").trim();
  const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Sorting — whitelist columns so the param can't inject anything.
  const SORTABLE = {
    email: "email",
    name: "name",
    status: "status",
    subscribed_at: "subscribed_at",
    first_source: "first_source",
  };
  const sort = SORTABLE[url.searchParams.get("sort")] || "subscribed_at";
  const dir =
    (url.searchParams.get("dir") || "desc").toLowerCase() === "asc"
      ? "asc"
      : "desc";

  const db = createServerSupabase();
  let query = db
    .from("newsletter_subscribers")
    .select(
      "email, name, status, first_source, sources, subscribed_at, unsubscribed_at, resend_synced_at",
      { count: "exact" },
    );

  if (status === "subscribed" || status === "unsubscribed") {
    query = query.eq("status", status);
  }
  if (q) {
    const safe = q.replace(/[%,]/g, " ");
    query = query.or(`email.ilike.%${safe}%,name.ilike.%${safe}%`);
  }

  query = query
    .order(sort, { ascending: dir === "asc", nullsFirst: false })
    .range(from, to);

  const { data, count, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    rows: data || [],
    page,
    page_size: PAGE_SIZE,
    total: count ?? 0,
    total_pages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
    sort,
    dir,
  });
}
