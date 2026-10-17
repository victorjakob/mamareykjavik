// POST /api/claim/[id] — public. Redeems a product credit exactly once.
// Body: { name? } (optional name the customer types).
//
// Race-safe: one conditional UPDATE … WHERE id = $1 AND status = 'unclaimed'
// AND (expires_at IS NULL OR expires_at > now) RETURNING …  — Postgres applies
// it atomically, so of two simultaneous taps only one gets a row back; the
// other sees the credit already claimed.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";
import { isCreditId, effectiveStatus, PUBLIC_CREDIT_COLUMNS } from "@/lib/productCredits";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const { id } = await params;
  if (!isCreditId(id)) return NextResponse.json({ error: "invalid", status: "invalid" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || "").trim().slice(0, 100) || null;
  const session = await getServerSession(authOptions).catch(() => null);
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || null;
  const ua = (req.headers.get("user-agent") || "").slice(0, 300) || null;
  const nowIso = new Date().toISOString();

  const supabase = createServerSupabase();
  const { data: claimed, error } = await supabase
    .from("product_credits")
    .update({
      status: "claimed",
      claimed_at: nowIso,
      claimed_name: name,
      claimed_by_email: session?.user?.email || null,
      claimed_ip: ip,
      claimed_user_agent: ua,
    })
    .eq("id", id)
    .eq("status", "unclaimed")
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .select(PUBLIC_CREDIT_COLUMNS)
    .maybeSingle();
  if (error) {
    console.error("[credits] claim failed", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
  if (claimed) return NextResponse.json({ ok: true, credit: claimed });

  // Nothing updated: tell the customer why.
  const { data: credit } = await supabase
    .from("product_credits")
    .select(PUBLIC_CREDIT_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  const status = effectiveStatus(credit);
  return NextResponse.json({ ok: false, status, credit: credit || null }, { status: 409 });
}
