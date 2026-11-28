// GET   /api/admin/customers/:id  — one customer, its account and its history
// PATCH /api/admin/customers/:id  — edit; `account` upserts the on-account row
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { ADMIN_SELECT, accountFields, customerFields, friendlyDbError, requireAdmin } from "@/lib/customers/admin";
import { one } from "@/lib/customers/shared";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f-]{36}$/i;

export async function GET(_request, { params }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const supabase = createServerSupabase();
  const { data: customer, error } = await supabase.from("customers").select(ADMIN_SELECT).eq("id", id).maybeSingle();
  if (error || !customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // History: linked rows, plus rows that only share the email (not yet linked).
  const email = customer.email;
  const by = (col) => (email ? `customer_id.eq.${id},${col}.eq."${email}"` : `customer_id.eq.${id}`);
  const [bookings, tribe, gifts, bills, merged] = await Promise.all([
    supabase
      .from("restaurant_bookings")
      .select("id, reference_id, booking_date, booking_time, party, status, customer_id")
      .or(by("contact_email"))
      .order("booking_date", { ascending: false })
      .limit(50),
    supabase
      .from("tribe_cards")
      .select("id, discount_percent, status, issued_at, expires_at, customer_id")
      .or(by("holder_email"))
      .order("issued_at", { ascending: false })
      .limit(10),
    supabase
      .from("gift_cards")
      .select("id, amount, remaining_balance, status, created_at, expires_at, customer_id")
      .or(by("buyer_email"))
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("pos_bills")
      .select("id, receipt_number, status, opened_at, closed_at, total_isk, discount_isk")
      .eq("customer_id", id)
      .order("opened_at", { ascending: false })
      .limit(50),
    supabase.from("customers").select("id, name, email").eq("merged_into", id).limit(20),
  ]);

  return NextResponse.json({
    customer: { ...customer, customer_accounts: one(customer.customer_accounts) },
    history: {
      bookings: bookings.data ?? [],
      tribeCards: tribe.data ?? [],
      giftCards: gifts.data ?? [],
      bills: bills.data ?? [],
      mergedFrom: merged.data ?? [],
    },
  });
}

export async function PATCH(request, { params }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const supabase = createServerSupabase();

  const { fields, error: invalid } = customerFields(body);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
  if (Object.keys(fields).length) {
    const { error } = await supabase.from("customers").update(fields).eq("id", id);
    if (error) return NextResponse.json({ error: friendlyDbError(error) }, { status: 400 });
  }

  if (body.account && typeof body.account === "object") {
    const prev = await supabase.from("customer_accounts").select("active").eq("customer_id", id).maybeSingle();
    const acct = accountFields(body.account, prev.data, session.user?.email);
    const { error } = await supabase.from("customer_accounts").upsert({ customer_id: id, ...acct }, { onConflict: "customer_id" });
    if (error) {
      console.error("admin customer account save failed", error);
      return NextResponse.json({ error: "Could not save the account." }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true });
}
