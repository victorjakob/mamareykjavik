# Website AI chat assistant ("Ask Mama")

The chat bubble on every public page of mama.is. It answers guests' questions with AI and can forward requests to the team by email. Set up November 2026.

## How it works

```
Guest → ContactChatbox (browser)
      → POST /api/assistant/chat (server, holds the API key)
          → builds the system prompt: static knowledge + live menu + live events (Supabase)
          → OpenRouter → DeepSeek V4.1 Flash
          → optional tool call: send_to_team → email via Resend
          → saves the conversation to Supabase (assistant_conversations)
      ← reply
```

## Files

| File | What it does |
|---|---|
| `src/app/components/Navbar/ContactChatbox.jsx` | The bubble and panel. Opens in AI chat mode; "Message the team" switches to the original email form (prefilled with the guest's questions). Falls back to the form if the API returns 503. English/Icelandic by URL (`/is/...`). Header shows chat icon + "Ask Mama" + "AI" badge. |
| `src/app/api/assistant/chat/route.js` | The endpoint. Validates input, rate-limits per IP (25 msgs / 10 min), calls OpenRouter, runs the `send_to_team` tool, logs the chat. |
| `src/lib/assistant/knowledge.js` | **Edit this to change what the bot knows or how it behaves**: personality, rules, policies (dogs, kids, wheelchair, booking), gift cards, catering, membership, White Lotus, Kornhlaðan. |
| `src/lib/assistant/context.server.js` | Adds the live menu (`menu_items`, `menu_categories`) and next 120 days of events (`events`) to the prompt. Cached 5 min per instance. |
| `src/lib/assistant/handoff.server.js` | The `send_to_team` tool. Emails team@mama.is (restaurant) or team@whitelotus.is (events/venues) with summary + full chat, guest as reply-to. Max 3 per IP per hour. Never emails the guest's address. |
| `src/lib/assistant/log.server.js` | Upserts each chat into `assistant_conversations` by `session_id`. Best-effort, never breaks the chat. |
| `src/app/admin/assistant/` + `src/app/api/admin/assistant/route.js` | Admin page `/admin/assistant` (tile "Chat assistant" on the admin dashboard): read chats, filter, search, flag wrong answers, add notes, delete. Admins only. |
| `src/app/api/cron/purge-assistant-chats/route.js` | Daily 04:10: deletes chats whose last message is older than 90 days. In `vercel.json` and `src/automations/manifest.js`. |
| `supabase/migrations/20261128140000_assistant_conversations.sql` | The chat log table. RLS on with no policies = service role only. |
| `src/app/policies/privacy/PrivacyContent.jsx` | "Website Chat Assistant" section (EN/IS) describing the above. Keep in sync if behaviour changes. |

## Config

- `OPENROUTER_API_KEY` (Vercel env, Production + Preview): the site's OpenRouter key. Without it the endpoint returns 503 and the bubble shows the contact form.
- `ASSISTANT_MODEL` (optional): defaults to `deepseek/deepseek-v4.1-flash-1017`. Any OpenRouter model id that supports tool calling works.
- OpenRouter account: workspace "Mama Reykjavik", monthly budget $10, auto top-up $20 when below $5.
- Provider routing: `require_parameters: true` (tool support) and `data_collection: "deny"` (no storing/training), with a retry without the privacy filter if no provider matches.

## Rules that matter

- **Allergies:** allergen data isn't in the database yet. The bot must never call a dish safe or list "safe" dishes; it may only say which dishes *list* an ingredient and send the guest to staff. When allergens are added to `menu_items`, include them in `context.server.js` and relax the rule in `knowledge.js`.
- **Booking:** the link is `https://mama.is/restaurant/book-table`, which redirects to Dineout until the new booking system cut-over (`src/lib/restaurant/open.js`), then to the new system automatically. Booking is always recommended; walk-ins welcome up to 10. The bot cannot book yet.
- **Planned:** booking/cancelling through the chat (groups of 10 or fewer) once the new booking system has an API — add it as another tool next to `send_to_team`.
- Never let the bot give discounts, refunds or promises; never ask for payment details.

## Changing things

- What the bot says → `knowledge.js`. Menu and events update themselves.
- Look/feel of the bubble → `ContactChatbox.jsx` (copy strings in the `COPY` object).
- Switch model → `ASSISTANT_MODEL` env var, no code change.
- Retention → `RETENTION_DAYS` in the purge cron, and update the privacy policy.

## Model choice

Tested Nov 2026 on 29 real guest questions (EN + IS) against GLM 5.3 Flash, Qwen 3.8 Flash and Kimi K3.1 Pro. DeepSeek V4.1 Flash won: accurate, good Icelandic, fastest (~1.9 s), about $0.27 per 1,000 chats. GLM had broken Icelandic; Kimi returned empty replies and cost ~20×.

## Related

Victory Studio shows this site's AI spending and chat stats on the project card (AI icon) — see `docs/ai-module.md` in the victory-studio repo.
