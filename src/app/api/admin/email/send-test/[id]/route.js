// POST /api/admin/email/send-test/[id]
// -----------------------------------------------------------------------------
// Sends a templated email — using its sample previewProps — to a target
// address (defaults to the admin's own email). Used by the "Send test to me"
// button in /admin/email.
//
// Body (optional): { to: "someone@example.com", subjectOverride: "..." }
//
// Only works for entries with status: "templated". Legacy emails return 400
// with a hint telling the caller to migrate the template first.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Resend } from "resend";
import { render } from "@react-email/render";
import React from "react";
import { getEmailById } from "@/emails/manifest";
import { TEMPLATE_LOADERS } from "@/emails/templates.server";

export const dynamic = "force-dynamic";

const FROM = process.env.EMAIL_FROM || "Mama Reykjavik <team@mama.is>";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") return { ok: false };
  return { ok: true, session };
}

export async function POST(req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.RESEND_API_KEY)
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured." },
      { status: 500 },
    );

  const { id } = await params;
  const entry = getEmailById(id);
  if (!entry)
    return NextResponse.json({ error: "Unknown email id" }, { status: 404 });

  if (entry.status !== "templated")
    return NextResponse.json(
      {
        error:
          "This email has not been migrated to the React Email template system yet — send-test only works on templated emails. Migrate it from " +
          (entry.sourceFile || "its source file") +
          " first.",
      },
      { status: 400 },
    );

  // Body parsing — JSON optional
  let body = {};
  try {
    body = await req.json();
  } catch {
    /* no body */
  }
  const to = (body?.to && String(body.to).trim()) || auth.session.user.email;
  if (!to)
    return NextResponse.json(
      { error: "No recipient address available." },
      { status: 400 },
    );

  const loader = TEMPLATE_LOADERS[id];
  if (!loader)
    return NextResponse.json(
      { error: "Template loader not registered" },
      { status: 500 },
    );

  try {
    const mod = await loader();
    const Component = mod.default;
    const props = Component.previewProps || {};
    const html = await render(React.createElement(Component, props), {
      pretty: false,
    });
    const text = await render(React.createElement(Component, props), {
      plainText: true,
    });

    const subject =
      (body?.subjectOverride && String(body.subjectOverride).trim()) ||
      Component.subject ||
      `[Test] ${entry.name}`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: FROM,
      to,
      subject: `[Test] ${subject}`,
      html,
      text,
      replyTo: auth.session.user.email,
    });

    if (result.error) {
      console.error(`[email-send-test] Resend rejected:`, result.error);
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      to,
      messageId: result.data?.id,
    });
  } catch (err) {
    console.error(`[email-send-test] crashed for ${id}:`, err);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 },
    );
  }
}
