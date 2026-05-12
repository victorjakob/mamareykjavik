// POST /api/admin/email/preview-draft
// -----------------------------------------------------------------------------
// Renders a templated email with CUSTOM props (overrides each template's
// static `previewProps`). Used by the newsletter editor — and by any future
// "edit content" workflow — to show a live preview of what's being composed.
//
// Body: { id: string, props: object }
//   - id    — manifest id of the template (e.g. "monthly-newsletter")
//   - props — props to pass to the template component
//
// Returns: text/html — the rendered email
//
// Differs from /preview/[id] (which uses Component.previewProps) by letting
// the caller pass arbitrary props. Same auth requirement: admin only.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { renderEmail } from "@/emails/render.server";
import { getEmailById } from "@/emails/manifest";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") return { ok: false };
  return { ok: true, session };
}

export async function POST(req) {
  const auth = await requireAdmin();
  if (!auth.ok)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const props = body.props && typeof body.props === "object" ? body.props : {};

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

  try {
    const { html } = await renderEmail(id, props);
    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    console.error(`[preview-draft] render failed for ${id}:`, err);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 },
    );
  }
}
