// GET /api/tribe-cards/lookup?q=<name or email>
// Staff-facing search used by manager.mama.is.
//
// Gated by a simple shared internal key (TRIBE_LOOKUP_KEY) passed as
// `x-internal-key` header or `?key=` query. This is intentionally
// lightweight — the lookup only returns non-sensitive fields needed
// at the counter (name, discount, status, expiry). No tokens, no emails
// beyond what's needed to disambiguate.

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";

const INTERNAL_KEY = process.env.TRIBE_LOOKUP_KEY;

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const providedKey =
      req.headers.get("x-internal-key") || searchParams.get("key") || "";

    if (!INTERNAL_KEY) {
      console.error("TRIBE_LOOKUP_KEY is not set in env.");
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 },
      );
    }
    if (providedKey !== INTERNAL_KEY) return unauthorized();

    const qRaw = (searchParams.get("q") || "").trim();
    if (qRaw.length < 2) {
      return NextResponse.json({ cards: [] });
    }

    // This route runs under the service-role key, which bypasses RLS.
    // `q` is interpolated into a PostgREST `.or()` filter below, so any
    // character with filter-syntax meaning (commas, parens, operators)
    // could re-write the query. Strip them before interpolation.
    //
    //   `,` `(` `)` → PostgREST filter separators / grouping
    //   `%` `_`     → SQL LIKE wildcards we don't want the caller to inject
    //   `\`         → LIKE escape char
    //   `*`         → PostgREST wildcard alias
    //
    // We allow letters, numbers, spaces, and a small set of name-safe
    // punctuation (`-` `'` `.` `@` `+`) so Icelandic names and emails
    // survive.
    const q = qRaw
      .toLowerCase()
      .replace(/[,()%_\\*]/g, "")
      .replace(/[^\p{L}\p{N}\s\-'.@+]/gu, "")
      .trim()
      .slice(0, 80);

    if (q.length < 2) {
      return NextResponse.json({ cards: [] });
    }

    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("tribe_cards")
      .select(
        "id, holder_name, holder_email, holder_phone, discount_percent, duration_type, issued_at, expires_at, status, source",
      )
      .or(`holder_name.ilike.%${q}%,holder_email.ilike.%${q}%,holder_phone.ilike.%${q}%`)
      .order("status", { ascending: true }) // active first (alpha order: active < expired < revoked)
      .order("holder_name", { ascending: true })
      .limit(25);

    if (error) {
      console.error("lookup error:", error);
      return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
    }

    // Apply soft-expiry to returned rows.
    const now = new Date();
    const cards = (data || []).map((c) => ({
      ...c,
      status:
        c.status === "active" && c.expires_at && new Date(c.expires_at) < now
          ? "expired"
          : c.status,
    }));

    return NextResponse.json({ cards });
  } catch (error) {
    console.error("tribe lookup error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
