// Builds the assistant's system prompt: static knowledge + live menu + live
// upcoming events from Supabase. Cached in memory for a few minutes per
// server instance so a busy chat doesn't hit the database on every message.

import { createServerSupabase } from "@/util/supabase/server";
import { buildStaticKnowledge } from "./knowledge";

const CACHE_MS = 5 * 60 * 1000;
let cache = { at: 0, prompt: null };

const fmtDate = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Atlantic/Reykjavik",
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const kr = (n) =>
  n === null || n === undefined || n === "" ? null : `${Number(n).toLocaleString("en-US")} kr`;

async function loadMenu(supabase) {
  const [cats, items] = await Promise.all([
    supabase
      .from("menu_categories")
      .select("id, name, order")
      .or("internal_only.is.false,internal_only.is.null")
      .order("order"),
    supabase
      .from("menu_items")
      .select("name, name_is, description, price, category_id")
      .eq("available", true)
      .order("order"),
  ]);
  if (cats.error || items.error) throw cats.error || items.error;

  const lines = [];
  for (const c of cats.data || []) {
    const inCat = (items.data || []).filter((i) => i.category_id === c.id);
    if (!inCat.length) continue;
    lines.push(`${c.name}:`);
    for (const i of inCat) {
      const is = i.name_is && i.name_is !== i.name ? ` (IS: ${i.name_is})` : "";
      const price = kr(i.price) ? ` — ${kr(i.price)}` : "";
      const desc = i.description ? `: ${i.description.replace(/\s+/g, " ").trim()}` : "";
      lines.push(`- ${i.name}${is}${price}${desc}`);
    }
  }
  return lines.join("\n");
}

async function loadEvents(supabase) {
  const now = new Date();
  const until = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000);
  const { data, error } = await supabase
    .from("events")
    .select("name, date, slug, price, duration, early_bird_price, early_bird_date, sold_out, shortdescription")
    .gte("date", now.toISOString())
    .lte("date", until.toISOString())
    .order("date", { ascending: true })
    .limit(20);
  if (error) throw error;

  return (data || [])
    .map((e) => {
      const parts = [`- ${fmtDate.format(new Date(e.date))}: ${e.name}`];
      if (e.duration) parts.push(`(~${e.duration}h)`);
      const price = Number(e.price) > 0 ? kr(e.price) : "Free";
      let line = `${parts.join(" ")}. ${price}`;
      if (e.early_bird_price && e.early_bird_date && new Date(e.early_bird_date) > now) {
        line += ` (early bird ${kr(e.early_bird_price)} until ${fmtDate.format(new Date(e.early_bird_date))})`;
      }
      if (e.sold_out) line += ". SOLD OUT";
      if (e.shortdescription) line += `. ${e.shortdescription.replace(/\s+/g, " ").trim()}`;
      line += `. Tickets: https://mama.is/events/${e.slug}`;
      return line;
    })
    .join("\n");
}

export async function getAssistantSystemPrompt() {
  if (cache.prompt && Date.now() - cache.at < CACHE_MS) return cache.prompt;

  const today = fmtDate.format(new Date());
  let menu = "";
  let events = "";
  try {
    const supabase = createServerSupabase();
    [menu, events] = await Promise.all([loadMenu(supabase), loadEvents(supabase)]);
  } catch (err) {
    console.error("[assistant] live context failed:", err?.message || err);
  }

  const prompt = `${buildStaticKnowledge()}

TODAY: ${today} (Reykjavík time).

MENU (live, ISK):
${menu || "Menu temporarily unavailable — point guests to https://mama.is/restaurant/menu"}

UPCOMING EVENTS (live, next 120 days):
${events || "No upcoming events listed right now — see https://mama.is/events"}`;

  // Only cache a complete prompt, so a DB hiccup doesn't stick for 5 minutes.
  if (menu && events !== undefined) cache = { at: Date.now(), prompt };
  return prompt;
}
