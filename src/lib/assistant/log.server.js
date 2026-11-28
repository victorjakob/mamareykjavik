// Saves website chat conversations to Supabase (assistant_conversations) so
// the team can review them at /admin/assistant. Best-effort: a logging
// failure never breaks the chat.

import { createServerSupabase } from "@/util/supabase/server";

const SESSION_RE = /^[a-zA-Z0-9-]{16,64}$/;

export function validSessionId(id) {
  return typeof id === "string" && SESSION_RE.test(id);
}

export async function logConversation({ sessionId, messages, reply, page, lang, handedOff, handedOffTo }) {
  if (!validSessionId(sessionId)) return;
  try {
    const full = [
      ...messages
        .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) })),
      { role: "assistant", content: String(reply || "").slice(0, 4000) },
    ].slice(-80);

    const row = {
      session_id: sessionId,
      messages: full,
      message_count: full.filter((m) => m.role === "user").length,
      page: page || null,
      lang: lang || null,
      updated_at: new Date().toISOString(),
    };
    // Only ever set handed_off to true, never back to false.
    if (handedOff) {
      row.handed_off = true;
      row.handed_off_to = handedOffTo || null;
    }

    const supabase = createServerSupabase();
    const { error } = await supabase
      .from("assistant_conversations")
      .upsert(row, { onConflict: "session_id" });
    if (error) console.error("[assistant] log failed:", error.message);
  } catch (err) {
    console.error("[assistant] log failed:", err?.message || err);
  }
}
