// Deletes website chat conversations older than the retention period.
//
// Schedule: daily at 04:10. Chats can hold guests' names, emails and whatever
// else they type, so they are kept only as long as they're useful for
// improving the assistant. Retention is counted from the last message.
// Flagged chats are kept like the rest: copy anything worth keeping into the
// bot's knowledge (src/lib/assistant/knowledge.js) before it expires.
//
// Authorization: Bearer ${CRON_SECRET}, as every other cron here.

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { runWithLogging } from "@/lib/cronLog";

export const RETENTION_DAYS = 90;

const authorized = (req) =>
  !!process.env.CRON_SECRET &&
  req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;

async function purge(req) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("assistant_conversations")
    .delete()
    .lt("updated_at", cutoff)
    .select("id");

  if (error) {
    console.error("[cron/purge-assistant-chats]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, retentionDays: RETENTION_DAYS, cutoff, deleted: data?.length ?? 0 });
}

export async function GET(req) {
  return runWithLogging("cron-purge-assistant-chats", req, () => purge(req));
}

export async function POST(req) {
  return runWithLogging("cron-purge-assistant-chats", req, () => purge(req));
}
