// The till: a kennitala typed at the counter becomes a customer on the bill.
//
// Local customers first (free), then the national registry (paid, once per
// kennitala), and a hit is saved so it is never paid for again. On a
// not-found the till may send the same kennitala again with a typed name,
// which is saved with it. Creation is always this automatic path; the till
// has no separate "create customer".
//
// The answer carries only the till-safe fields. The kennitala and the address
// stay on the server.
import { createServerSupabase } from "@/util/supabase/server";
import { authorised, json, options } from "@/lib/customers/pos";
import { getRegistryProvider } from "@/lib/customers/registry";
import { findOrCreateByKennitala } from "@/lib/customers/byKennitala";

export const dynamic = "force-dynamic";

export const OPTIONS = options;

const NOT_FOUND = {
  company: "No customer with that kennitala. Companies are not looked up here: type the name.",
  "registry-off": "No customer with that kennitala, and the registry is not set up. Type the name.",
  "recent-miss": "The registry did not know that kennitala recently. Type the name.",
  miss: "The registry does not know that kennitala. Type the name.",
  error: "The registry could not be reached. Type the name, or try again.",
};

/** POST /api/pos/customers/by-kennitala  { kennitala, name? } */
export async function POST(request) {
  if (!authorised(request)) return json({ error: "Not authorised" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  try {
    const result = await findOrCreateByKennitala({
      supabase: createServerSupabase(),
      provider: getRegistryProvider(),
      kennitala: body?.kennitala,
      name: body?.name,
    });
    if (result.status === "invalid") {
      return json({ ok: false, error: "That is not a valid kennitala" }, { status: 400 });
    }
    if (result.customer) {
      return json({ ok: true, found: true, source: result.status, customer: result.customer });
    }
    return json({ ok: true, found: false, reason: result.status, message: NOT_FOUND[result.status] });
  } catch (err) {
    console.error("pos customer by kennitala failed", err?.message ?? err);
    return json({ error: "Could not look that up" }, { status: 500 });
  }
}
