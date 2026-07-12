// GET /api/cron/series-integrity
// -----------------------------------------------------------------------------
// Daily data-integrity check for event series ↔ instance linkage.
//
// Why: in July 2026 the upcoming "Free Your Voice" instance was created
// without its series_id FK, so the public series page (the canonical,
// sitemap-listed URL) showed "No upcoming sessions — check back soon"
// while tickets were on sale. This cron makes that failure mode
// self-healing and loud:
//
//   1. Finds events whose slug matches an active series prefix
//      ("<series-slug>-…") but whose series_id is null.
//   2. Auto-links them to the matching series.
//   3. Emails team@mama.is a summary whenever anything was fixed
//      (or when fixing failed), so slug/FK drift never goes unnoticed.
//
// Auth: Bearer {CRON_SECRET} — same pattern as the other crons.

import { NextResponse } from "next/server";
import { runWithLogging } from "@/lib/cronLog";
import { createServerSupabase } from "@/util/supabase/server";
import { createResend } from "@/lib/resend";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FROM = "Mama Reykjavik <team@mama.is>";
const ALERT_TO = ["team@mama.is"];

const isAuthorizedRequest = (req) =>
  req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}` ||
  req.headers.get("x-triggered-by") === "admin";

export async function GET(req) {
  if (!isAuthorizedRequest(req)) {
    return new NextResponse("forbidden", { status: 403 });
  }
  return runWithLogging("cron-series-integrity", req, () => doRun());
}

async function doRun() {
  const supabase = createServerSupabase();

  const { data: seriesList, error: seriesError } = await supabase
    .from("event_series")
    .select("id, slug, name")
    .eq("is_active", true);
  if (seriesError) throw seriesError;

  const fixed = [];
  const failed = [];

  for (const series of seriesList || []) {
    if (!series.slug) continue;

    const { data: orphans, error: orphanError } = await supabase
      .from("events")
      .select("id, slug, date")
      .is("series_id", null)
      .like("slug", `${series.slug}-%`);

    if (orphanError) {
      failed.push({ series: series.slug, error: orphanError.message });
      continue;
    }
    if (!orphans?.length) continue;

    const { error: updateError } = await supabase
      .from("events")
      .update({ series_id: series.id })
      .in(
        "id",
        orphans.map((o) => o.id)
      );

    if (updateError) {
      failed.push({ series: series.slug, error: updateError.message });
    } else {
      fixed.push(
        ...orphans.map((o) => ({ series: series.slug, slug: o.slug, date: o.date }))
      );
    }
  }

  if (fixed.length || failed.length) {
    await sendAlert({ fixed, failed });
  }

  return NextResponse.json({
    ok: failed.length === 0,
    seriesChecked: seriesList?.length || 0,
    autoLinked: fixed.length,
    failures: failed,
  });
}

async function sendAlert({ fixed, failed }) {
  try {
    const resend = createResend();
    const lines = [];

    if (fixed.length) {
      lines.push(
        `Auto-linked ${fixed.length} event instance(s) that were missing their series_id:`,
        ...fixed.map((f) => `  • ${f.slug} (${f.date}) → series "${f.series}"`)
      );
      lines.push(
        "",
        "These pages were at risk of showing “No upcoming sessions” while tickets were on sale.",
        "If new events keep arriving unlinked, check the event-creation flow."
      );
    }
    if (failed.length) {
      lines.push(
        "",
        `FAILED to auto-link for ${failed.length} series:`,
        ...failed.map((f) => `  • ${f.series}: ${f.error}`)
      );
    }

    await resend.emails.send({
      from: FROM,
      to: ALERT_TO,
      subject: `[Series integrity] ${fixed.length} auto-linked${failed.length ? `, ${failed.length} FAILED` : ""}`,
      text: lines.join("\n"),
    });
  } catch (err) {
    // Alerting must never crash the cron — the fix itself already ran.
    console.error("[series-integrity] alert email failed:", err?.message || err);
  }
}
