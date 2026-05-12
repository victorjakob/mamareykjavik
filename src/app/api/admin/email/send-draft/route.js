// POST /api/admin/email/send-draft
// -----------------------------------------------------------------------------
// Sends a templated email with CUSTOM props (from the newsletter editor or
// any future "compose & send" workflow). Differs from /send-test/[id] (which
// uses static previewProps) by letting the caller pass arbitrary content.
//
// Body: {
//   id:      string,                                  // manifest id
//   props:   object,                                  // props for the template
//   target:  "test" | "community" | "tribe" | "all",  // audience
//   to?:     string,                                  // overrides target=test recipient
//   subject?: string,                                 // overrides Template.subject
// }
//
// For target = "test" the recipient defaults to the logged-in admin's email.
// For audience targets (community/tribe/all) we currently return 501 — those
// require Resend Broadcasts + audience setup which is a separate task. The
// editor's UI still shows the buttons so the flow is visible; when broadcast
// is wired up, only this route changes.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Resend } from "resend";
import { renderEmail } from "@/emails/render.server";
import { getEmailById } from "@/emails/manifest";

export const dynamic = "force-dynamic";

const FROM = process.env.EMAIL_FROM || "Mama Reykjavik <team@mama.is>";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") return { ok: false };
  return { ok: true, session };
}

export async function POST(req) {
  const auth = await requireAdmin();
  if (!auth.ok)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.RESEND_API_KEY)
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured." },
      { status: 500 },
    );

  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const props = body.props && typeof body.props === "object" ? body.props : {};
  const target = ["test", "community", "tribe", "all"].includes(body.target)
    ? body.target
    : "test";
  const overrideTo =
    typeof body.to === "string" && body.to.trim() ? body.to.trim() : null;
  const subjectOverride =
    typeof body.subject === "string" && body.subject.trim()
      ? body.subject.trim()
      : null;

  if (!id)
    return NextResponse.json({ error: "id is required" }, { status: 400 });

  const entry = getEmailById(id);
  if (!entry)
    return NextResponse.json({ error: "Unknown email id" }, { status: 404 });

  if (entry.status !== "templated")
    return NextResponse.json(
      { error: "Drafts only work for templated emails." },
      { status: 400 },
    );

  // ── Audience-targeted sends: not yet wired ────────────────────────
  // When Resend Broadcasts + audience filtering land, this branch becomes
  // the real send. Today it returns 501 so the UI can show the button
  // without sending anything.
  if (target !== "test") {
    return NextResponse.json(
      {
        error: "Audience broadcast is not yet configured.",
        detail:
          "Configure Resend Broadcasts + audience lists, then this route can send to community / tribe / all. " +
          "For now, use 'Send test to me' to verify the content renders correctly.",
      },
      { status: 501 },
    );
  }

  // ── target === "test" → send to the admin (or override) ──────────
  const to = overrideTo || auth.session.user.email;
  if (!to)
    return NextResponse.json(
      { error: "No recipient address available." },
      { status: 400 },
    );

  try {
    const { html, text, subject } = await renderEmail(id, props);

    const resend = new Resend(process.env.RESEND_API_KEY);
    const finalSubject =
      subjectOverride || subject || `[Test] ${entry.name}`;

    const result = await resend.emails.send({
      from: FROM,
      to,
      subject: `[Test] ${finalSubject}`,
      html,
      text,
      replyTo: auth.session.user.email,
    });

    if (result.error) {
      console.error(`[send-draft] Resend rejected:`, result.error);
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      to,
      target: "test",
      messageId: result.data?.id,
    });
  } catch (err) {
    console.error(`[send-draft] crashed for ${id}:`, err);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 },
    );
  }
}
