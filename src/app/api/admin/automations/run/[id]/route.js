// POST /api/admin/automations/run/[id]
// -----------------------------------------------------------------------------
// Admin-triggered cron run. Proxies a request to the cron route with the
// proper Bearer ${CRON_SECRET} auth + an `X-Triggered-By: admin` header so
// the cron log can distinguish admin runs from scheduled ones.
//
// Only works for entries in the manifest with group="cron" (i.e. the things
// vercel.json schedules). Webhook + admin-action automations aren't reachable
// here — they have their own trigger paths (a customer payment, an admin
// clicking a button on a specific feature page).

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getAutomationById } from "@/automations/manifest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") return { ok: false };
  return { ok: true };
}

function getBaseUrl(req) {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  const proto = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

export async function POST(req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.CRON_SECRET)
    return NextResponse.json(
      { error: "CRON_SECRET is not configured — set it in env and redeploy." },
      { status: 500 },
    );

  const { id } = await params;
  const entry = getAutomationById(id);
  if (!entry)
    return NextResponse.json({ error: "Unknown automation" }, { status: 404 });

  if (entry.group !== "cron" || !entry.cronPath)
    return NextResponse.json(
      {
        error:
          "Only scheduled automations can be triggered from the admin. " +
          "Webhooks fire from third-party calls; admin actions have their own buttons.",
      },
      { status: 400 },
    );

  // Proxy to the actual cron route with the required auth header.
  // The cron handler's runWithLogging() wrapper will record the run with
  // triggered_by="admin" because of the X-Triggered-By header.
  const baseUrl = getBaseUrl(req);
  const cronUrl = `${baseUrl}${entry.cronPath}`;

  try {
    const res = await fetch(cronUrl, {
      method: "GET",
      headers: {
        authorization: `Bearer ${process.env.CRON_SECRET}`,
        "x-triggered-by": "admin",
      },
      cache: "no-store",
    });

    let body = null;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }

    return NextResponse.json(
      { ok: res.ok, status: res.status, body },
      { status: res.ok ? 200 : 502 },
    );
  } catch (err) {
    console.error(`[automations/run/${id}] proxy failed:`, err);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 },
    );
  }
}
