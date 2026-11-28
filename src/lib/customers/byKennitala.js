// Find or create a customer by kennitala, cheapest first.
//
//   1. `customers` (free). A merged row is followed to its survivor.
//   2. A name typed at the till after a not-found: saved with the kennitala,
//      no registry call (staff already saw it is not there).
//   3. The registry (paid), only for a person's kennitala, only when the
//      provider is set up, and not again within MISS_TTL_DAYS of a miss.
//      A hit creates the customer, so it is never paid for twice.
//
// Every paid call is written to `customer_registry_lookups` (when, outcome,
// no payload) so the cost can be counted.
import { TILL_SELECT, digitsOf, isCompanyKennitala, isValidKennitala, toTillRow } from "./shared";

export const MISS_TTL_DAYS = 30;

async function findLocal(supabase, kt) {
  const { data, error } = await supabase.from("customers").select(TILL_SELECT).eq("kennitala", kt).maybeSingle();
  if (error) throw error;
  let row = data;
  for (let i = 0; row?.merged_into && i < 5; i++) {
    const next = await supabase.from("customers").select(TILL_SELECT).eq("id", row.merged_into).maybeSingle();
    if (next.error) throw next.error;
    row = next.data;
  }
  return row ?? null;
}

/** Insert, or take the row a concurrent request just made with this kennitala. */
async function createWithKennitala(supabase, kt, fields) {
  const { data, error } = await supabase
    .from("customers")
    .insert({ kennitala: kt, kind: isCompanyKennitala(kt) ? "company" : "person", ...fields })
    .select(TILL_SELECT)
    .single();
  if (!error) return data;
  if (error.code === "23505") return findLocal(supabase, kt);
  throw error;
}

/**
 * Resolves to { status, customer? } where status is
 *   local | created | manual   with customer (till-safe fields only)
 *   invalid | company | registry-off | recent-miss | miss | error   without.
 */
export async function findOrCreateByKennitala({ supabase, provider, kennitala, name }) {
  const kt = digitsOf(kennitala);
  if (!isValidKennitala(kt)) return { status: "invalid" };

  const local = await findLocal(supabase, kt);
  if (local) return { status: "local", customer: toTillRow(local) };

  const typed = typeof name === "string" ? name.trim().slice(0, 120) : "";
  if (typed.length >= 2) {
    const row = await createWithKennitala(supabase, kt, { name: typed, created_from: "pos" });
    return { status: "manual", customer: toTillRow(row) };
  }

  // Þjóðskrá is the register of people; a company is typed in by hand.
  if (isCompanyKennitala(kt)) return { status: "company" };
  if (!provider) return { status: "registry-off" };

  const since = new Date(Date.now() - MISS_TTL_DAYS * 86400_000).toISOString();
  const recent = await supabase
    .from("customer_registry_lookups")
    .select("id")
    .eq("kennitala", kt)
    .eq("outcome", "miss")
    .gte("looked_up_at", since)
    .limit(1);
  if (recent.error) throw recent.error;
  if (recent.data?.length) return { status: "recent-miss" };

  const answer = await provider.lookup(kt);
  let created = null;
  if (answer.status === "hit") {
    created = await createWithKennitala(supabase, kt, {
      name: answer.person.name,
      address: answer.person.address ?? null,
      postal_code: answer.person.postalCode ?? null,
      town: answer.person.town ?? null,
      created_from: "thjodskra-lookup",
    });
  }
  const log = await supabase.from("customer_registry_lookups").insert({
    kennitala: kt,
    provider: provider.name,
    outcome: answer.status,
    http_status: answer.http ?? null,
    customer_id: created?.id ?? null,
  });
  if (log.error) console.error("registry lookup not logged", log.error);

  if (created) return { status: "created", customer: toTillRow(created) };
  return { status: answer.status === "miss" ? "miss" : "error" };
}
