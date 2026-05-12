// Shared admin auth gate for /api/private-session/admin/* routes.
// Returns { ok: true, supabase } if admin; otherwise { ok: false, res }
// containing a NextResponse the route should return as-is.

import { NextResponse } from "next/server";
import { isAdmin } from "@/util/getRole";
import { createServerSupabase } from "@/util/supabase/server";

export async function requireAdminAndSupabase() {
  if (!(await isAdmin())) {
    return {
      ok: false,
      res: NextResponse.json({ error: "forbidden" }, { status: 404 }),
    };
  }
  return { ok: true, supabase: createServerSupabase() };
}
