// "Ask the team" action for the website assistant. The model calls the
// send_to_team tool once the guest has given their name + email and agreed;
// this sends the request to the right inbox with the chat attached and the
// guest as reply-to. Nothing is ever emailed to the guest's address, so the
// bot can't be used to spam third parties.

import { createResend } from "@/lib/resend";

const INBOXES = {
  restaurant: "team@mama.is",
  events: "team@whitelotus.is",
};

export const SEND_TO_TEAM_TOOL = {
  type: "function",
  function: {
    name: "send_to_team",
    description:
      "Forward the guest's request to the Mama team by email so a human gets back to them. Only call this after the guest has given their name and a valid email address AND said yes to sending it. Never call it without their confirmation.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        team: {
          type: "string",
          enum: ["restaurant", "events"],
          description:
            "restaurant = Mama restaurant, food, catering, gift cards, membership, complaints, collaborations, general. events = White Lotus, Kornhlaðan, venue rental, weddings, private events, event tickets.",
        },
        name: { type: "string", description: "Guest's name" },
        email: { type: "string", description: "Guest's email address for the reply" },
        phone: { type: "string", description: "Guest's phone number, only if they gave one" },
        topic: { type: "string", description: "Short subject, max 8 words, in English" },
        summary: {
          type: "string",
          description:
            "Clear summary of what the guest wants, with all useful details they gave (dates, group size, etc.). Write it in English for the team.",
        },
      },
      required: ["team", "name", "email", "topic", "summary"],
    },
  },
};

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Max 3 handoffs per IP per hour (per serverless instance).
const sent = new Map();
function handoffLimited(ip) {
  const now = Date.now();
  const list = (sent.get(ip) || []).filter((t) => now - t < 60 * 60 * 1000);
  if (list.length >= 3) return true;
  list.push(now);
  sent.set(ip, list);
  return false;
}

export async function sendToTeam(args, { history, ip, page }) {
  const name = String(args?.name || "").trim().slice(0, 100);
  const email = String(args?.email || "").trim().slice(0, 200);
  const phone = String(args?.phone || "").trim().slice(0, 40);
  const topic = String(args?.topic || "Website chat request").trim().slice(0, 120);
  const summary = String(args?.summary || "").trim().slice(0, 3000);
  const to = INBOXES[args?.team] || INBOXES.restaurant;

  if (!name || !EMAIL_RE.test(email) || !summary) {
    return { ok: false, error: "missing_or_invalid_details" };
  }
  if (handoffLimited(ip)) return { ok: false, error: "too_many_requests" };

  const transcript = history
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-16)
    .map(
      (m) =>
        `<tr><td style="padding:6px 10px;vertical-align:top;color:#9a7a62;font-size:12px;white-space:nowrap">${
          m.role === "user" ? "Guest" : "Bot"
        }</td><td style="padding:6px 10px;font-size:14px;white-space:pre-wrap">${esc(m.content)}</td></tr>`
    )
    .join("");

  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#2c1810;max-width:640px">
<p style="font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#ff914d;margin:0 0 6px">Website chat · needs a reply</p>
<h2 style="margin:0 0 16px">${esc(topic)}</h2>
<table style="border-collapse:collapse;margin-bottom:16px;font-size:14px">
<tr><td style="padding:3px 12px 3px 0;color:#9a7a62">Name</td><td>${esc(name)}</td></tr>
<tr><td style="padding:3px 12px 3px 0;color:#9a7a62">Email</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
${phone ? `<tr><td style="padding:3px 12px 3px 0;color:#9a7a62">Phone</td><td>${esc(phone)}</td></tr>` : ""}
${page ? `<tr><td style="padding:3px 12px 3px 0;color:#9a7a62">Page</td><td>${esc(page)}</td></tr>` : ""}
</table>
<div style="background:#fff6ee;border:1px solid #ffd2b0;border-radius:10px;padding:14px 16px;white-space:pre-wrap;font-size:14px">${esc(summary)}</div>
<p style="margin:22px 0 6px;font-size:12px;color:#9a7a62">Full chat</p>
<table style="border-collapse:collapse;width:100%;background:#faf6f2;border-radius:10px">${transcript}</table>
<p style="margin-top:18px;font-size:12px;color:#9a7a62">Reply to this email to answer the guest directly. The details above were collected by the AI assistant; please double-check them.</p>
</div>`;

  const text = `Website chat · needs a reply\n${topic}\n\nName: ${name}\nEmail: ${email}${phone ? `\nPhone: ${phone}` : ""}${
    page ? `\nPage: ${page}` : ""
  }\n\n${summary}\n\n--- Full chat ---\n${history
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-16)
    .map((m) => `${m.role === "user" ? "Guest" : "Bot"}: ${m.content}`)
    .join("\n\n")}`;

  try {
    const resend = createResend();
    await resend.emails.send({
      from: "Mama.is chat <team@mama.is>",
      to,
      replyTo: email,
      subject: `Chat: ${topic} (${name})`,
      html,
      text,
    });
    return { ok: true, sent_to: to };
  } catch (err) {
    console.error("[assistant] handoff email failed:", err?.message || err);
    return { ok: false, error: "email_failed" };
  }
}
