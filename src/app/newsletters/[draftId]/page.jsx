// /newsletters/[draftId]
// Server-rendered shell that fetches the draft and hands it to the client
// editor. Behind admin/host auth via AdminGuard.

import { notFound } from "next/navigation";
import { createServerSupabase } from "@/util/supabase/server";
import AdminGuard from "@/app/admin/AdminGuard";
import {
  DEFAULT_HEADER_KICKER,
  DEFAULT_HEADER_TITLE,
} from "@/lib/newsletter-template";
import NewsletterEditor from "./NewsletterEditor";

export const dynamic = "force-dynamic";

export default async function NewsletterEditorPage({ params }) {
  const { draftId } = await params;
  const supabase = createServerSupabase();

  const { data: draft } = await supabase
    .from("newsletter_drafts")
    .select(
      "id, send_date, status, subject, preheader, intro_note, events_json, html, sent_at, error_message, highlight_event_id, header_kicker, header_title",
    )
    .eq("id", draftId)
    .maybeSingle();

  if (!draft) {
    notFound();
  }

  return (
    <AdminGuard>
      {/* Defaults come from the renderer (server-only module) so the editor's
          placeholder text can never drift from what the letter actually
          prints when a field is left untouched. */}
      <NewsletterEditor
        draft={draft}
        headerDefaults={{
          kicker: DEFAULT_HEADER_KICKER,
          title: DEFAULT_HEADER_TITLE,
        }}
      />
    </AdminGuard>
  );
}
