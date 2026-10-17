// /api/admin/credits — admin only.
//   GET  ?q=<code|id|name> → { credits } newest first (q = quick lookup)
//   POST { item_label, menu_item_id?, menu_category_id?, customer_name?,
//          customer_contact?, note?, expires_at? } → { credit }
// Nothing is sent: the admin copies the claim link and shares it.
import { NextResponse } from "next/server";
import { requireAdminSession, jsonError } from "@/lib/api/session";
import { createServerSupabase } from "@/util/supabase/server";
import {
  parseCreditInput,
  newCreditCode,
  claimUrl,
  isCreditId,
  normalizeCode,
  effectiveStatus,
} from "@/lib/productCredits";

export const dynamic = "force-dynamic";

const COLUMNS =
  "id, code, item_label, menu_item_id, menu_category_id, customer_name, customer_contact, note, expires_at, status, created_at, created_by, claimed_at, claimed_name, claimed_by_email, claimed_ip, claimed_user_agent, cancelled_at, cancelled_by";

const withUrl = (c) => ({ ...c, url: claimUrl(c.id), effective_status: effectiveStatus(c) });

export async function GET(req) {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;

  const q = (new URL(req.url).searchParams.get("q") || "").trim();
  let query = createServerSupabase()
    .from("product_credits")
    .select(COLUMNS)
    .order("created_at", { ascending: false })
    .limit(200);

  if (q) {
    // Quick lookup for counter staff: exact id (or pasted claim URL), code,
    // or a customer-name / label search.
    const idMatch = q.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    if (idMatch && isCreditId(idMatch[0])) {
      query = query.eq("id", idMatch[0]);
    } else {
      const code = normalizeCode(q);
      const like = `%${q.replace(/[%_,()]/g, " ").slice(0, 60)}%`;
      query = query.or(
        [code ? `code.eq.${code}` : null, `customer_name.ilike.${like}`, `item_label.ilike.${like}`]
          .filter(Boolean)
          .join(",")
      );
    }
  }

  const { data, error } = await query;
  if (error) return jsonError(error);
  return NextResponse.json({ credits: (data || []).map(withUrl) });
}

export async function POST(req) {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;

  const body = await req.json().catch(() => ({}));
  const parsed = parseCreditInput(body);
  if (!parsed.ok) return jsonError(parsed.error, 400);
  const v = parsed.value;

  const supabase = createServerSupabase();
  // Retry on the (very unlikely) chance of a duplicate short code.
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data, error } = await supabase
      .from("product_credits")
      .insert({
        code: newCreditCode(),
        item_label: v.itemLabel,
        menu_item_id: v.menuItemId,
        menu_category_id: v.menuCategoryId,
        customer_name: v.customerName,
        customer_contact: v.customerContact,
        note: v.note,
        expires_at: v.expiresAt,
        created_by: session.user?.email || null,
      })
      .select(COLUMNS)
      .single();
    if (!error) return NextResponse.json({ credit: withUrl(data) });
    if (error.code !== "23505") return jsonError(error);
  }
  return jsonError("Could not generate a unique code, please try again");
}
