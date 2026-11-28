// Website chat assistant. POST { messages: [{ role: "user"|"assistant", content }] }
// → { reply }. Calls an OpenRouter model (DeepSeek Flash by default) with the
// knowledge from src/lib/assistant. The API key never leaves the server.
//
// Env:
//   OPENROUTER_API_KEY  required — without it the endpoint answers 503 and the
//                       chat UI falls back to the contact form.
//   ASSISTANT_MODEL     optional — defaults to deepseek/deepseek-v4.1-flash-1017

import { NextResponse } from "next/server";
import { getAssistantSystemPrompt } from "@/lib/assistant/context.server";
import { SEND_TO_TEAM_TOOL, sendToTeam } from "@/lib/assistant/handoff.server";
import { logConversation } from "@/lib/assistant/log.server";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = process.env.ASSISTANT_MODEL || "deepseek/deepseek-v4.1-flash-1017";
const MAX_TURNS = 12; // messages of history sent to the model
const MAX_CHARS = 800; // per visitor message

// Simple in-memory rate limit per IP. Per serverless instance only, which is
// fine as an abuse brake; the OpenRouter key's spend limit is the hard cap.
const hits = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 25;

function rateLimited(ip) {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.start > WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 });
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (now - v.start > WINDOW_MS) hits.delete(k);
    }
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_PER_WINDOW;
}

function cleanMessages(input) {
  if (!Array.isArray(input)) return null;
  const msgs = input
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim()
    )
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, m.role === "user" ? MAX_CHARS : 2000) }));
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") return null;
  return msgs;
}

async function callModel(messages, { privateProviders }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const body = {
      model: MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 1200,
      tools: [SEND_TO_TEAM_TOOL],
      tool_choice: "auto",
    };
    // Only route to providers that support tool calling, and prefer ones that
    // don't store or train on prompts.
    body.provider = privateProviders
      ? { require_parameters: true, data_collection: "deny" }
      : { require_parameters: true };

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mama.is",
        "X-Title": "Mama.is chat",
      },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok && !json.error, status: res.status, json };
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request) {
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: "assistant_unavailable" }, { status: 503 });
  }

  const ip =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const history = cleanMessages(payload?.messages);
  if (!history) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  try {
    const system = await getAssistantSystemPrompt();
    const messages = [{ role: "system", content: system }, ...history];
    const page = typeof payload?.page === "string" ? payload.page.slice(0, 200) : "";

    let privateProviders = true;
    const ask = async () => {
      let r = await callModel(messages, { privateProviders });
      // If no provider matches the privacy preference, retry without it.
      if (!r.ok && privateProviders && /no endpoints|no allowed providers/i.test(r.json?.error?.message || "")) {
        privateProviders = false;
        r = await callModel(messages, { privateProviders });
      }
      return r;
    };

    let result = await ask();
    let handedOff = false;
    let handedOffTo = null;

    // Let the model use the send_to_team action, then answer the guest.
    for (let round = 0; round < 2; round++) {
      const msg = result.json?.choices?.[0]?.message;
      const calls = result.ok ? msg?.tool_calls : null;
      if (!calls?.length) break;

      messages.push({ role: "assistant", content: msg.content || "", tool_calls: calls });
      for (const call of calls) {
        let output;
        if (call.function?.name === "send_to_team" && !handedOff) {
          let args = {};
          try {
            args = JSON.parse(call.function.arguments || "{}");
          } catch {}
          output = await sendToTeam(args, { history, ip, page });
          if (output.ok) {
            handedOff = true;
            handedOffTo = output.sent_to;
          }
        } else {
          output = { ok: false, error: handedOff ? "already_sent" : "unknown_tool" };
        }
        messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(output) });
      }
      result = await ask();
    }

    const reply = result.json?.choices?.[0]?.message?.content?.trim();
    if (!result.ok || !reply) {
      console.error("[assistant] model error:", result.status, result.json?.error?.message);
      return NextResponse.json({ error: "assistant_failed" }, { status: 502 });
    }
    await logConversation({
      sessionId: payload?.sessionId,
      messages: Array.isArray(payload?.messages) ? payload.messages : history,
      reply,
      page,
      lang: payload?.lang === "is" ? "is" : "en",
      handedOff,
      handedOffTo,
    });

    return NextResponse.json({ reply, handedOff });
  } catch (err) {
    console.error("[assistant] failed:", err?.message || err);
    return NextResponse.json({ error: "assistant_failed" }, { status: 502 });
  }
}
