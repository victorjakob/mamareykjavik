// AI fallback for the FB importer.
//
// FB has effectively closed off unauthenticated server-side scraping for
// most events. When the URL importer comes back near-empty, the host can
// open the event in their browser (where they're logged in), select-all
// the visible event content, and paste it here. We send that raw text to
// OpenAI with a structured-output schema and return the same shape the URL
// importer returns, so the existing form-fill logic just works.

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const toDateTimeLocalValue = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

const SYSTEM_PROMPT = `You extract structured event details from raw text copy-pasted from a Facebook event page. Return only JSON matching the provided schema.

Rules:
- name: the event title only (no host names, no date suffixes).
- shortdescription: one engaging sentence, max 280 characters, suitable for a listings page.
- description: the full long-form event description, cleaned up. Keep paragraph breaks. Strip Facebook UI chrome like "See less", "Suggested events", footer links, "Guests", "Privacy / Terms / Advertising" navigation, etc.
- start_iso: best-guess ISO 8601 timestamp WITH timezone offset for when the event starts. If the year is missing, assume the next future occurrence relative to the current date in the user-supplied "today" hint. If only the date is given (no time), assume 19:00 local time. Use Iceland time (Atlantic/Reykjavik, UTC+0) unless the text explicitly says otherwise. Return null if no date is mentioned.
- end_iso: only if the text explicitly mentions an end time; otherwise null.
- location: short, human-readable venue line. Default to "Bankastræti 2, 101 Reykjavik" if the text mentions White Lotus / Mama Reykjavík and no other address. Return null if location is unclear.

Be faithful to the source — don't invent details that aren't in the text.`;

const SCHEMA = {
  name: "fb_event_extraction",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      name: { type: ["string", "null"] },
      shortdescription: { type: ["string", "null"] },
      description: { type: ["string", "null"] },
      start_iso: { type: ["string", "null"] },
      end_iso: { type: ["string", "null"] },
      location: { type: ["string", "null"] },
    },
    required: [
      "name",
      "shortdescription",
      "description",
      "start_iso",
      "end_iso",
      "location",
    ],
  },
  strict: true,
};

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        message:
          "OpenAI API key isn't configured on the server. Add OPENAI_API_KEY to .env.local.",
      }),
      { status: 500 }
    );
  }

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length < 30) {
      return new Response(
        JSON.stringify({
          message:
            "Paste at least the event title + description. We need something to work with.",
        }),
        { status: 400 }
      );
    }

    const todayHint = new Date().toISOString().slice(0, 10);

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.1,
        response_format: {
          type: "json_schema",
          json_schema: SCHEMA,
        },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Today's date for relative-date hints: ${todayHint}\n\n--- BEGIN PASTED EVENT TEXT ---\n${text}\n--- END PASTED EVENT TEXT ---`,
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      return new Response(
        JSON.stringify({
          message: `Extraction failed: OpenAI returned ${aiRes.status}.`,
          detail: errText.slice(0, 400),
        }),
        { status: 502 }
      );
    }

    const aiBody = await aiRes.json();
    const raw = aiBody?.choices?.[0]?.message?.content || "{}";
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return new Response(
        JSON.stringify({ message: "AI returned malformed JSON." }),
        { status: 502 }
      );
    }

    const date = toDateTimeLocalValue(parsed.start_iso);
    let durationHours = null;
    if (parsed.start_iso && parsed.end_iso) {
      const ms =
        new Date(parsed.end_iso).getTime() -
        new Date(parsed.start_iso).getTime();
      if (ms > 0) durationHours = +(ms / 3600000).toFixed(2);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        extracted: {
          name: parsed.name,
          shortdescription: parsed.shortdescription,
          description: parsed.description,
          date,
          duration: durationHours ? String(durationHours) : null,
          location: parsed.location,
          facebook_link: null, // Caller already has the URL field if they want.
          image: null, // Pasted text has no image.
          image_remote_url: null,
        },
        warnings: {
          missing_date: !date,
          missing_description: !parsed.description,
          missing_image: true,
          image_download_failed: false,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: `Extraction failed: ${error?.message || "unknown error"}`,
      }),
      { status: 500 }
    );
  }
}
