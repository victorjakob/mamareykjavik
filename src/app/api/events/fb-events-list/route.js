// Lists upcoming Facebook events our pages own or co-host, for the "pick from
// your events" dropdown on the create-event form.
//
// Uses the same page tokens as the importer (White Lotus + Mama). For a page
// token, `/me/events` returns that page's events. We merge both pages, drop
// past/cancelled ones, dedupe (an event co-hosted by both pages appears once),
// and sort soonest-first. Returns only what the dropdown needs: id, name, date.

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

const GRAPH_VERSION = "v22.0";

async function fetchPageEvents(token, pageLabel) {
  if (!token) return [];
  try {
    const url =
      `https://graph.facebook.com/${GRAPH_VERSION}/me/events` +
      `?fields=id,name,start_time,is_canceled&limit=50&access_token=${encodeURIComponent(
        token,
      )}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data || data.error || !Array.isArray(data.data)) return [];
    return data.data
      .filter((e) => e && e.id && e.name && !e.is_canceled)
      .map((e) => ({
        id: e.id,
        name: e.name,
        start_time: e.start_time || null,
        page: pageLabel,
      }));
  } catch {
    return [];
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const [wl, mama] = await Promise.all([
    fetchPageEvents(process.env.FACEBOOK_WHITELOTUS_PAGE_TOKEN, "White Lotus"),
    fetchPageEvents(process.env.FACEBOOK_MAMA_PAGE_TOKEN, "Mama"),
  ]);

  // Dedupe by id (co-hosted events show up under both page tokens).
  const byId = new Map();
  for (const ev of [...wl, ...mama]) {
    if (!byId.has(ev.id)) byId.set(ev.id, ev);
  }

  // Keep upcoming only (12h grace so events happening today still show), and
  // sort soonest-first for the dropdown.
  const now = Date.now();
  const events = [...byId.values()]
    .filter((e) => {
      if (!e.start_time) return true;
      const t = new Date(e.start_time).getTime();
      return isNaN(t) || t > now - 12 * 60 * 60 * 1000;
    })
    .sort((a, b) => {
      const ta = a.start_time ? new Date(a.start_time).getTime() : Infinity;
      const tb = b.start_time ? new Date(b.start_time).getTime() : Infinity;
      return ta - tb;
    });

  return new Response(JSON.stringify({ events }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
