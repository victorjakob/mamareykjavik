// /api/admin/payment-links — admin only.
//   GET  → { links } newest first (history list)
//   POST { amount, reference, name, contact, days } → { link }
// Creates the payment_links row and returns the URL to copy. Nothing is sent.
import crypto from "crypto";
import { NextResponse } from "next/server";
import { requireAdminSession, jsonError } from "@/lib/api/session";
import { createServerSupabase } from "@/util/supabase/server";
import { parsePaymentLinkInput, paymentLinkUrl } from "@/lib/paymentLinks";

export const dynamic = "force-dynamic";

const COLUMNS =
  "id, amount_isk, reference, customer_name, customer_contact, url, status, created_at, created_by, expires_at, paid_at, teya_transaction_id";

export async function GET() {
  // `refund` is exposed from callback_payload so the list can show refunds
  // without sending the full Teya payload to the browser.
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;
  const { data, error } = await createServerSupabase()
    .from("payment_links")
    .select(`${COLUMNS}, refund:callback_payload->refund`)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return jsonError(error);
  return NextResponse.json({ links: data || [] });
}

export async function POST(req) {
  const session = await requireAdminSession();
  if (session instanceof NextResponse) return session;

  const body = await req.json().catch(() => ({}));
  const parsed = parsePaymentLinkInput(body);
  if (!parsed.ok) return jsonError(parsed.error, 400);
  const v = parsed.value;

  const id = crypto.randomUUID();
  const { data, error } = await createServerSupabase()
    .from("payment_links")
    .insert({
      id,
      amount_isk: v.amount,
      reference: v.reference,
      customer_name: v.name,
      customer_contact: v.contact || null,
      url: paymentLinkUrl(id),
      status: "created",
      created_by: session.user?.email || null,
      expires_at: v.expiresAt,
    })
    .select(COLUMNS)
    .single();
  if (error) return jsonError(error);
  return NextResponse.json({ link: data });
}
