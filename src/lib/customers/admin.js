import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  clampPct,
  cleanScope,
  digitsOf,
  isCompanyKennitala,
  isValidKennitala,
  normaliseEmail,
} from "./shared";

/** Admin only (not host): customer records carry kennitala and discounts. */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") return null;
  return session;
}

export const ADMIN_SELECT =
  "id, name, email, phone, company, kind, kennitala, preferred_language, notes, marketing_opt_in, created_from, source_table, merged_into, address, postal_code, town, created_at, updated_at, customer_accounts(active, activated_by, activated_at, discount_pct, discount_scope, monthly_cap_isk, payday_customer_id, is_staff)";

const text = (v, max = 200) => {
  if (v === undefined) return undefined;
  const s = String(v ?? "").trim().slice(0, max);
  return s || null;
};

/** The customer fields an admin may set. Returns { fields } or { error }. */
export function customerFields(body, { creating = false } = {}) {
  const f = {};
  if (creating || body.name !== undefined) {
    const name = text(body.name, 120);
    if (!name || name.length < 2) return { error: "A name is needed." };
    f.name = name;
  }
  if (body.email !== undefined) {
    const email = normaliseEmail(body.email);
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "That email does not look right." };
    f.email = email;
  }
  if (body.kennitala !== undefined) {
    const kt = digitsOf(body.kennitala);
    if (kt && !isValidKennitala(kt)) return { error: "That kennitala is not valid." };
    f.kennitala = kt || null;
    if (kt && body.kind === undefined) f.kind = isCompanyKennitala(kt) ? "company" : "person";
  }
  for (const k of ["phone", "company", "notes", "address", "town"]) {
    if (body[k] !== undefined) f[k] = text(body[k], k === "notes" ? 2000 : 200);
  }
  if (body.postal_code !== undefined) f.postal_code = text(body.postal_code, 10);
  if (body.preferred_language !== undefined) f.preferred_language = text(body.preferred_language, 8);
  if (body.kind !== undefined) f.kind = body.kind === "company" ? "company" : "person";
  if (body.marketing_opt_in !== undefined) {
    f.marketing_opt_in = body.marketing_opt_in === true;
    f.marketing_opted_in_at = f.marketing_opt_in ? new Date().toISOString() : null;
    f.marketing_source = f.marketing_opt_in ? "admin" : null;
  }
  if (creating) f.created_from = "manual";
  return { fields: f };
}

/** The on-account fields. `active` only gates charging to the account. */
export function accountFields(a, previous, adminEmail) {
  const f = {};
  if (a.active !== undefined) {
    f.active = a.active === true;
    if (f.active && !previous?.active) {
      f.activated_by = adminEmail ?? "admin";
      f.activated_at = new Date().toISOString();
    }
  }
  if (a.discount_pct !== undefined) f.discount_pct = clampPct(a.discount_pct);
  if (a.discount_scope !== undefined) f.discount_scope = cleanScope(a.discount_scope);
  if (a.monthly_cap_isk !== undefined) {
    const n = Math.round(Number(a.monthly_cap_isk));
    f.monthly_cap_isk = a.monthly_cap_isk === null || a.monthly_cap_isk === "" || !Number.isFinite(n) ? null : Math.max(0, n);
  }
  if (a.is_staff !== undefined) f.is_staff = a.is_staff === true;
  if (a.payday_customer_id !== undefined) f.payday_customer_id = text(a.payday_customer_id, 60);
  return f;
}

export const friendlyDbError = (error) =>
  error?.code === "23505"
    ? error.message?.includes("kennitala")
      ? "Another customer already has that kennitala."
      : "Another customer already has that email."
    : "Could not save.";
