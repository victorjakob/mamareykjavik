// GET /api/admin/subscribers/detail?email=...
// Full profile for one subscriber: their master-list row plus everything we
// know about them across the business (account, tickets, membership, tribe
// card) — for the dashboard's row-click modal.
//
// Admin or host session required.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

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
  const email = (url.searchParams.get("email") || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const db = createServerSupabase();

  const [subscriber, account, tickets, membership, tribe] = await Promise.all([
    db.from("newsletter_subscribers").select("*").eq("email", email).maybeSingle(),
    db.from("users").select("id, name, role, created_at, email_subscription").eq("email", email).maybeSingle(),
    db.from("tickets").select("created_at, status, variant_name").eq("buyer_email", email),
    db
      .from("membership_subscriptions")
      .select("tier, status, created_at, current_period_end")
      .eq("member_email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    db
      .from("tribe_cards")
      .select("status, discount_percent, expires_at, created_at")
      .eq("holder_email", email)
      .maybeSingle(),
  ]);

  const ticketRows = tickets.data || [];
  const paidTickets = ticketRows.filter((t) => t.status === "paid");
  const lastTicketAt = ticketRows.reduce((acc, t) => {
    if (!t.created_at) return acc;
    return !acc || t.created_at > acc ? t.created_at : acc;
  }, null);

  return NextResponse.json({
    ok: true,
    subscriber: subscriber.data || null,
    enrichment: {
      account: account.data
        ? {
            registered_at: account.data.created_at,
            name: account.data.name,
            role: account.data.role,
            email_subscription: account.data.email_subscription,
          }
        : null,
      tickets: {
        total: ticketRows.length,
        paid: paidTickets.length,
        last_at: lastTicketAt,
      },
      membership: membership.data || null,
      tribe_card: tribe.data || null,
    },
  });
}
