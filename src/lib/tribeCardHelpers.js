// Tribe Card server-side helpers
// ─────────────────────────────
// Small utilities shared between admin API routes.

export const DURATION_TYPES = ["month", "6months", "year", "unlimited"];
export const SOURCES = ["legacy", "paid-tribe", "gift", "friends-family", "other"];

export function durationToExpiry(durationType, from = new Date()) {
  const base = new Date(from);
  switch (durationType) {
    case "month": {
      const d = new Date(base);
      d.setMonth(d.getMonth() + 1);
      return d.toISOString();
    }
    case "6months": {
      const d = new Date(base);
      d.setMonth(d.getMonth() + 6);
      return d.toISOString();
    }
    case "year": {
      const d = new Date(base);
      d.setFullYear(d.getFullYear() + 1);
      return d.toISOString();
    }
    case "unlimited":
      return null;
    default:
      return null;
  }
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Attempt to find an existing auth user by email so we can set user_id
// when we issue the card. Uses the supabase-js admin API. Returns the user
// id or null. Non-fatal on errors.
export async function findUserIdByEmail(supabaseAdmin, email) {
  try {
    // supabase-js v2: listUsers paginates; search in small pages.
    // We also have the public `auth.users` view via SQL. Try the admin API first.
    let page = 1;
    const perPage = 200;
    while (page <= 10) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });
      if (error || !data) break;
      const match = data.users?.find(
        (u) => (u.email || "").toLowerCase() === email.toLowerCase(),
      );
      if (match) return match.id;
      if (!data.users || data.users.length < perPage) break;
      page += 1;
    }
  } catch (err) {
    console.warn("findUserIdByEmail failed:", err?.message || err);
  }
  return null;
}
