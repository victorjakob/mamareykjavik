// POST /api/sendgrid/gatekeeper-wrap
// Body: { event_id: uuid }  -- the event whose wrap-up email to send
//
// Used by the cron job (and optionally manually from the reconciliation
// screen via a "send me the wrap now" button). Auth via CRON_SECRET OR
// a valid session whose user manages the event.

import { Resend } from "resend";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";
import { buildReport } from "@/app/api/events/gatekeeper/[slug]/report/buildReport";
import { renderEmail } from "@/emails/render.server";

const resend = new Resend(process.env.RESEND_API_KEY);

function isAuthorizedCron(req) {
  const authHeader = req.headers.get("authorization");
  return !!process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ message: "Invalid JSON" }), { status: 400 });
  }

  if (!body.event_id) {
    return new Response(JSON.stringify({ message: "event_id required" }), { status: 400 });
  }

  const supabase = createServerSupabase();

  const { data: event, error: evErr } = await supabase
    .from("events")
    .select("id, name, slug, date, host, host_secondary, price")
    .eq("id", body.event_id)
    .maybeSingle();
  if (evErr) return new Response(JSON.stringify({ message: evErr.message }), { status: 500 });
  if (!event) return new Response(JSON.stringify({ message: "Event not found" }), { status: 404 });

  // Auth: either CRON secret OR a logged-in manager of this event
  if (!isAuthorizedCron(req)) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }
    const email = (session.user.email || "").toLowerCase();
    const isManager =
      session.user.role === "admin" ||
      (event.host || "").toLowerCase() === email ||
      (event.host_secondary || "").toLowerCase() === email;
    if (!isManager) {
      return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 });
    }
  }

  try {
    const report = await buildReport(supabase, event);

    const { html, text } = await renderEmail("gatekeeper-event-wrap-recap", {
      eventName: event.name,
      eventDate: event.date,
      totals: report.totals,
      walkIns: report.walkIns,
    });

    const recipients = Array.from(
      new Set(
        [event.host, event.host_secondary]
          .map((e) => (typeof e === "string" ? e.trim() : ""))
          .filter(Boolean)
      )
    );
    if (recipients.length === 0) {
      return new Response(JSON.stringify({ message: "No recipients" }), { status: 400 });
    }

    await resend.emails.send({
      from: "Mama Reykjavik <team@mama.is>",
      to: recipients,
      subject: `Your ${event.name} recap`,
      html,
      text,
    });

    await supabase
      .from("gatekeeper_configs")
      .update({ wrap_sent_at: new Date().toISOString() })
      .eq("event_id", event.id);

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("Gatekeeper wrap email failed:", err);
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  }
}
