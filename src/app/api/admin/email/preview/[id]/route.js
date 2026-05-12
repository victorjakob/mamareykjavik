// GET /api/admin/email/preview/[id]
// -----------------------------------------------------------------------------
// Returns the rendered HTML for an email template. Used by the preview iframe
// inside /admin/email.
//
// For "templated" entries: dynamically imports the React Email component,
// renders it with its sample previewProps, and returns the HTML.
//
// For "legacy" entries: returns a friendly placeholder card with metadata
// and a link to the source file. (Once the legacy email is migrated to a
// React Email template, the manifest entry flips to "templated" and this
// route serves the real preview automatically.)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { render } from "@react-email/render";
import React from "react";
import { getEmailById } from "@/emails/manifest";
import { TEMPLATE_LOADERS, ADAPTER_LOADERS } from "@/emails/templates.server";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") return { ok: false };
  return { ok: true, session };
}

export async function GET(_req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const entry = getEmailById(id);
  if (!entry)
    return NextResponse.json({ error: "Unknown email id" }, { status: 404 });

  // ── Templated: render the real React Email component ─────────────
  if (entry.status === "templated") {
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
      return new NextResponse(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    } catch (err) {
      console.error(`[email-preview] render failed for ${id}:`, err);
      return new NextResponse(
        renderErrorPage(entry, err),
        { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
      );
    }
  }

  // ── Legacy with adapter: render the actual production HTML ───────
  // Adapters are pure render functions extracted from the live route
  // handlers — what you see here is byte-for-byte what customers receive.
  const adapterLoader = ADAPTER_LOADERS[id];
  if (adapterLoader) {
    try {
      const mod = await adapterLoader();
      const html = mod.renderHtml(mod.previewProps || {});
      return new NextResponse(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    } catch (err) {
      console.error(`[email-preview] adapter failed for ${id}:`, err);
      return new NextResponse(renderErrorPage(entry, err), {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
  }

  // ── Legacy without adapter: friendly placeholder with metadata ──
  return new NextResponse(renderLegacyPlaceholder(entry), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

// -----------------------------------------------------------------------------
// Rendering helpers — plain-string HTML so they don't need React Email.

function escape(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderLegacyPlaceholder(entry) {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<title>${escape(entry.name)}</title>
<style>
  html,body { margin:0; padding:0; background:#f9f4ec; color:#2c1810;
    font-family:"Helvetica Neue", Helvetica, Arial, sans-serif; }
  .wrap { max-width:600px; margin:48px auto; padding:0 20px; }
  .card { background:#fff; border:1px solid #e8ddd3; border-radius:14px;
    box-shadow:0 2px 14px rgba(60,30,10,.06); overflow:hidden; }
  .accent { height:2px; background:linear-gradient(to right,#ff914d,rgba(255,145,77,0)); }
  .body { padding:32px 30px; }
  .eyebrow { font-size:10px; letter-spacing:.32em; text-transform:uppercase;
    color:#9a7a62; font-weight:600; margin:0 0 10px; }
  h1 { font-family:"Cormorant Garamond","Playfair Display",Georgia,serif;
    font-style:italic; font-weight:400; font-size:28px; margin:0 0 6px;
    line-height:1.15; color:#2c1810; }
  .subject { font-size:14px; color:#9a7a62; margin:0 0 22px; }
  table.meta { width:100%; border-collapse:collapse; font-size:13px; }
  table.meta th { text-align:left; color:#9a7a62; font-weight:500;
    padding:10px 12px 10px 0; vertical-align:top; width:32%;
    border-top:1px solid #f0e6d8; }
  table.meta td { padding:10px 0; vertical-align:top;
    border-top:1px solid #f0e6d8; color:#2c1810; line-height:1.55; }
  table.meta tr:first-child th, table.meta tr:first-child td { border-top:none; }
  .pill { display:inline-block; padding:3px 10px; border-radius:999px;
    background:rgba(154,122,98,.12); color:#6a5040; font-size:11px;
    font-weight:600; letter-spacing:.05em; }
  .pill.legacy { background:rgba(255,145,77,.14); color:#a75a1a; }
  .note { margin-top:20px; padding:14px 16px; background:#faf6f2;
    border:1px solid #f0e6d8; border-radius:10px; font-size:13px;
    color:#6a5040; line-height:1.55; }
  code { background:#f0e6d8; padding:2px 6px; border-radius:4px;
    font-family:"SF Mono", Menlo, Consolas, monospace; font-size:12px;
    color:#2c1810; }
</style></head>
<body><div class="wrap"><div class="card">
  <div class="accent"></div>
  <div class="body">
    <p class="eyebrow">${escape(entry.group || "")} · Legacy</p>
    <h1>${escape(entry.name)}</h1>
    ${entry.subjectLine ? `<p class="subject">Subject: ${escape(entry.subjectLine)}</p>` : ""}

    <table class="meta">
      <tr><th>Status</th><td><span class="pill legacy">Legacy — inline HTML</span></td></tr>
      <tr><th>Trigger</th><td>${escape(entry.trigger || "—")}</td></tr>
      <tr><th>Recipient</th><td>${escape(entry.recipient || "—")}</td></tr>
      <tr><th>Provider</th><td>${escape(entry.provider || "—")}</td></tr>
      <tr><th>Source</th><td><code>${escape(entry.sourceFile || "—")}</code></td></tr>
      ${entry.note ? `<tr><th>Note</th><td>${escape(entry.note)}</td></tr>` : ""}
    </table>

    <div class="note">
      This email is currently sent as inline HTML from its source file.
      Once it's migrated to the shared brand template system (in
      <code>src/emails/templates/</code>), this preview will show the
      live rendered version.
    </div>
  </div>
</div></div></body></html>`;
}

function renderErrorPage(entry, err) {
  return `<!doctype html>
<html><head><meta charset="utf-8" /><title>Render error</title>
<style>
  body { font-family: system-ui, sans-serif; padding:30px; background:#fdecec;
    color:#7c1d1d; }
  pre { background:#fff; padding:14px; border-radius:8px;
    border:1px solid rgba(124,29,29,.18); white-space:pre-wrap;
    font-size:12px; line-height:1.5; }
</style></head><body>
  <h2>Could not render ${escape(entry.name)}</h2>
  <pre>${escape(String(err?.stack || err?.message || err))}</pre>
</body></html>`;
}
