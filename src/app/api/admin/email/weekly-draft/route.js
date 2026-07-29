// GET /api/admin/email/weekly-draft
// -----------------------------------------------------------------------------
// Resolves the weekly Monday letter's current draft so /admin/email can link
// straight to its editor (and re-send the preview) instead of making you go
// hunting through /admin/subscribers.
//
// Returns the newest row still in status "draft" (i.e. waiting for approval);
// if there isn't one, the most recent row of any status, flagged as not
// pending. Rows can also be "sent" or "skipped".

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

const COLS = "id, send_date, status, events_json, highlight_event_id";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (role !== "admin" && role !== "host") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabase();

  const pending = await supabase
    .from("newsletter_drafts")
    .select(COLS)
    .eq("status", "draft")
    .order("send_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  let draft = pending?.data || null;
  const pendingApproval = !!draft;

  if (!draft) {
    const latest = await supabase
      .from("newsletter_drafts")
      .select(COLS)
      .order("send_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    draft = latest?.data || null;
  }

  if (!draft) {
    return NextResponse.json({ draft: null });
  }

  return NextResponse.json({
    draft: {
      id: draft.id,
      sendDate: draft.send_date,
      status: draft.status,
      pendingApproval,
      eventsCount: Array.isArray(draft.events_json)
        ? draft.events_json.length
        : 0,
      editorHref: `/newsletters/${draft.id}`,
    },
  });
}
