// /newsletters/[draftId]
// Server-rendered shell that fetches the draft and hands it to the client
// editor. Behind admin/host auth via AdminGuard.

import { notFound } from "next/navigation";
import { createServerSupabase } from "@/util/supabase/server";
import AdminGuard from "@/app/admin/AdminGuard";
import NewsletterEditor from "./NewsletterEditor";

export const dynamic = "force-dynamic";

export default async function NewsletterEditorPage({ params }) {
  const { draftId } = await params;
  const supabase = createServerSupabase();

  const { data: draft } = await supabase
    .from("newsletter_drafts")
    .select(
      "id, send_date, status, subject, preheader, intro_note, events_json, html, sent_at, error_message, highlight_event_id",
    )
    .eq("id", draftId)
    .maybeSingle();

  if (!draft) {
    notFound();
  }

  return (
    <AdminGuard>
      <NewsletterEditor draft={draft} />
    </AdminGuard>
  );
}
