// The till's customer search: name or company, a few letters at a time.
//
// Reads `customers` with their `customer_accounts` row (POS repo,
// database-migrations/007) and answers exactly what the till's
// `customerFromRow` needs. Never kennitala, email, phone or address: a tablet
// at the counter has no use for them. Rows merged into another are skipped.
import { createServerSupabase } from "@/util/supabase/server";
import { authorised, json, options } from "@/lib/customers/pos";
import { TILL_SELECT, safeLike, toTillRow } from "@/lib/customers/shared";

export const dynamic = "force-dynamic";

export const OPTIONS = options;

/** GET /api/pos/customers?q=anna&limit=20 */
export async function GET(request) {
  if (!authorised(request)) return json({ error: "Not authorised" }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const q = safeLike(params.get("q"));
  const limit = Math.min(20, Math.max(1, Number(params.get("limit")) || 20));
  if (q.length < 2) return json({ ok: true, customers: [] });
  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("customers")
      .select(TILL_SELECT)
      .is("merged_into", null)
      .or(`name.ilike.%${q}%,company.ilike.%${q}%`)
      .order("name")
      .limit(limit);
    if (error) throw error;
    return json({ ok: true, customers: (data ?? []).map(toTillRow) });
  } catch (err) {
    console.error("pos customer search failed", err);
    return json({ error: "Could not search" }, { status: 500 });
  }
}
