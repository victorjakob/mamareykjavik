// The national registry (Þjóðskrá), for a PERSON's kennitala.
//
// Þjóðskrá sells register data to businesses through intermediaries, each with
// its own API. So this is one small interface with one generic HTTP provider,
// switched on by environment variables, and off when they are unset (the
// till's local lookup still works, and a not-found lets staff type a name).
//
//   THJODSKRA_API_URL   e.g. https://provider.example/persons/{kt}
//                       ({kt} is replaced; without it the kennitala is appended)
//   THJODSKRA_API_KEY   sent as the Authorization header
//   THJODSKRA_AUTH_SCHEME  optional, e.g. "Bearer" (default) or "" for the raw key
//
// Já's company register is NOT used here (Victor: Já stays company-only).
//
// lookup(kt) resolves to one of:
//   { status: "hit", person: { name, address, postalCode, town } }
//   { status: "miss", http }      the registry does not know the kennitala
//   { status: "error", http }     the call failed; not cached as a miss

const pick = (o, keys) => {
  for (const k of keys) {
    const parts = k.split(".");
    let v = o;
    for (const p of parts) v = v && typeof v === "object" ? v[p] : undefined;
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return null;
};

/** Field names differ by provider; take the common ones. */
export function personFromPayload(payload) {
  const p = payload?.person ?? payload?.data ?? payload?.result ?? payload;
  if (!p || typeof p !== "object") return null;
  const name = pick(p, ["name", "fullName", "full_name", "nafn", "fullt_nafn"]);
  if (!name) return null;
  const postal = pick(p, ["postalCode", "postal_code", "postcode", "postnumer", "address.postalCode", "legalAddress.postalCode", "heimilisfang.postnumer"]);
  return {
    name: String(name).trim(),
    address: (pick(p, ["address.street", "legalAddress.street", "street", "address", "heimilisfang.gata", "heimili"]) ?? null),
    postalCode: postal != null ? String(postal) : null,
    town: pick(p, ["town", "city", "stadur", "sveitarfelag", "postnumerStadur", "address.town", "address.city", "legalAddress.town", "heimilisfang.stadur"]),
  };
}

export function getRegistryProvider(env = process.env) {
  const url = env.THJODSKRA_API_URL;
  const key = env.THJODSKRA_API_KEY;
  if (!url || !key) return null;
  const scheme = env.THJODSKRA_AUTH_SCHEME ?? "Bearer";
  return {
    name: "thjodskra",
    async lookup(kt, fetchImpl = fetch) {
      const target = url.includes("{kt}") ? url.replace("{kt}", kt) : `${url.replace(/\/$/, "")}/${kt}`;
      try {
        const res = await fetchImpl(target, {
          headers: { Authorization: scheme ? `${scheme} ${key}` : key, Accept: "application/json" },
          cache: "no-store",
        });
        if (res.status === 404) return { status: "miss", http: 404 };
        if (!res.ok) return { status: "error", http: res.status };
        const person = personFromPayload(await res.json().catch(() => null));
        return person ? { status: "hit", person, http: res.status } : { status: "miss", http: res.status };
      } catch {
        return { status: "error", http: null };
      }
    },
  };
}
