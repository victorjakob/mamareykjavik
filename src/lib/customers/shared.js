// Shared by /api/pos/customers* (the till) and /api/admin/customers* (mama.is
// admin). One customer row in `customers`, its on-account settings in
// `customer_accounts` (POS repo, database-migrations/007 and 008).

/** The till's menu categories, by id, for a scoped discount. */
export const DISCOUNT_CATEGORIES = [
  { id: "food", label: "Food" },
  { id: "drinks", label: "Drinks" },
  { id: "smoothie-juice", label: "Smoothie/Juice" },
  { id: "dessert", label: "Dessert" },
  { id: "store", label: "Store" },
  { id: "lotus", label: "Lotus" },
];
const CATEGORY_IDS = new Set(DISCOUNT_CATEGORIES.map((c) => c.id));

export const digitsOf = (v) => String(v ?? "").replace(/\D/g, "");

/**
 * A kennitala's check digit (the ninth): weights 3,2,7,6,5,4,3,2 over the
 * first eight, 11 minus the sum mod 11, 11 reads as 0 and 10 is never valid.
 * Checked before anything paid is asked.
 */
export function isValidKennitala(value) {
  const d = digitsOf(value);
  if (d.length !== 10) return false;
  const w = [3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += Number(d[i]) * w[i];
  let check = 11 - (sum % 11);
  if (check === 11) check = 0;
  if (check === 10) return false;
  if (check !== Number(d[8])) return false;
  // The last digit is the century: 9 (1900s), 0 (2000s), 8 (1800s).
  return ["9", "0", "8"].includes(d[9]);
}

/** Day part 41–71 is a company's. */
export const isCompanyKennitala = (value) => {
  const d = digitsOf(value);
  const day = Number(d.slice(0, 2));
  return d.length === 10 && day >= 41 && day <= 71;
};

export const normaliseEmail = (v) => {
  const s = String(v ?? "").trim().toLowerCase();
  return s || null;
};

/** null = whole menu; otherwise a non-empty list of known category ids. */
export function cleanScope(v) {
  if (!Array.isArray(v)) return null;
  const ids = [...new Set(v.filter((x) => typeof x === "string" && CATEGORY_IDS.has(x)))];
  return ids.length > 0 && ids.length < CATEGORY_IDS.size ? ids : null;
}

export const clampPct = (v) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
};

/** PostgREST returns a one-to-one embed as an object, sometimes as an array. */
export const one = (v) => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null));

/**
 * What a tablet may see of a customer: exactly what the till's
 * `customerFromRow` reads. Never kennitala, email, phone or address.
 */
export function toTillRow(row) {
  const a = one(row.customer_accounts);
  return {
    id: row.id,
    name: row.name,
    company: row.company ?? null,
    kind: row.kind ?? null,
    account: a
      ? {
          active: a.active === true,
          discount_pct: a.discount_pct ?? 0,
          discount_scope: a.discount_scope ?? null,
          is_staff: a.is_staff === true,
        }
      : null,
  };
}

export const TILL_SELECT =
  "id, name, company, kind, merged_into, customer_accounts(active, discount_pct, discount_scope, is_staff)";

/** For a PostgREST `or` filter: drop the characters that would break it. */
export const safeLike = (q) => String(q ?? "").replace(/[,()%*\\:"']/g, " ").trim().slice(0, 60);
