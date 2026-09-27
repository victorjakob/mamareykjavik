// /api/events/manage/[slug]/attendance — data for the classic attendance page
// (/events/manager/[slug]/attendance). Same access rule as the manage hub.
//   GET  ?sortBy=created_at&sortOrder=desc → { event, tickets }
//   POST { ticketId, used }                 → toggle check-in
//   PUT  { message }                        → email every attendee

import { NextResponse } from "next/server";
import { resolveEventAccess } from "@/lib/eventAccess";
import { createServerSupabase } from "@/util/supabase/server";
import { createResend } from "@/lib/resend";
import { renderEmail } from "@/emails/render.server";

export const dynamic = "force-dynamic";

const ACTIVE = ["paid", "door", "cash", "card", "transfer"];
const SORTABLE = new Set([
  "created_at",
  "buyer_name",
  "buyer_email",
  "quantity",
  "status",
  "used",
  "total_price",
  "price",
]);

async function access(params) {
  const { slug } = await params;
  const result = await resolveEventAccess(slug, {});
  if (result.error) return { res: NextResponse.json({ error: result.error }, { status: 500 }) };
  if (result.notFound) return { res: NextResponse.json({ error: "Event not found" }, { status: 404 }) };
  if (!result.allowed) return { res: NextResponse.json({ error: "Not allowed" }, { status: 403 }) };
  return { event: result.event };
}

export async function GET(req, { params }) {
  const a = await access(params);
  if (a.res) return a.res;

  const url = new URL(req.url);
  const sortBy = SORTABLE.has(url.searchParams.get("sortBy"))
    ? url.searchParams.get("sortBy")
    : "created_at";
  const ascending = url.searchParams.get("sortOrder") === "asc";

  const { data, error } = await createServerSupabase()
    .from("tickets")
    .select(
      "id, order_id, buyer_email, buyer_name, quantity, status, used, created_at, variant_name, price, total_price, transaction_id, refund_status, refund_amount, refunded_at"
    )
    .eq("event_id", a.event.id)
    .in("status", ACTIVE)
    .order(sortBy, { ascending });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { id, name, date, sold_out } = a.event;
  return NextResponse.json({ event: { id, name, date, sold_out }, tickets: data || [] });
}

export async function POST(req, { params }) {
  const a = await access(params);
  if (a.res) return a.res;

  const body = await req.json().catch(() => ({}));
  if (!body.ticketId) return NextResponse.json({ error: "ticketId is required" }, { status: 400 });

  const supabase = createServerSupabase();
  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, event_id")
    .eq("id", body.ticketId)
    .maybeSingle();
  if (!ticket || ticket.event_id !== a.event.id)
    return NextResponse.json({ error: "Ticket not found for this event" }, { status: 404 });

  const { error } = await supabase
    .from("tickets")
    .update({ used: !!body.used })
    .eq("id", body.ticketId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PUT(req, { params }) {
  const a = await access(params);
  if (a.res) return a.res;

  const body = await req.json().catch(() => ({}));
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  // Recipients come from the database, never from the browser.
  const { data: tickets, error } = await createServerSupabase()
    .from("tickets")
    .select("buyer_email")
    .eq("event_id", a.event.id)
    .in("status", ACTIVE);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const emails = Array.from(
    new Set(
      (tickets || [])
        .map((t) => (t.buyer_email || "").trim().toLowerCase())
        .filter((e) => e.includes("@"))
    )
  );
  if (emails.length === 0)
    return NextResponse.json({ error: "No attendees to message" }, { status: 400 });

  const { html, text } = await renderEmail("message-attendance-broadcast", {
    eventName: a.event.name,
    eventDate: a.event.date,
    message,
  });
  const resend = createResend();
  await Promise.all(
    emails.map((email) =>
      resend.emails.send({
        from: "White Lotus <team@mama.is>",
        to: [email],
        subject: `Important Message Regarding ${a.event.name}`,
        html,
        text,
      })
    )
  );
  return NextResponse.json({ success: true, sent: emails.length });
}
