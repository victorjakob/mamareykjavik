// Browser-side stand-in for the Supabase client, for admin pages that edit
// tables the public key can no longer write (currently the menu tables).
// `adminDb.from(table)...` records the query chain and runs it through
// POST /api/admin/db, which checks the admin session. Results have the same
// { data, error, count } shape as Supabase.

function builder(table, calls = []) {
  let pending = null;
  const run = () => {
    if (!pending) {
      pending = fetch("/api/admin/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, calls }),
      })
        .then(async (res) => {
          const body = await res.json().catch(() => null);
          if (body && typeof body === "object" && "data" in body) {
            return { data: body.data ?? null, error: body.error ?? null, count: body.count ?? null };
          }
          return { data: null, error: { message: `Request failed (${res.status})` }, count: null };
        })
        .catch((err) => ({ data: null, error: { message: err?.message || "Network error" }, count: null }));
    }
    return pending;
  };
  return new Proxy(
    {},
    {
      get(_t, prop) {
        if (prop === "then") return (resolve, reject) => run().then(resolve, reject);
        if (prop === "catch") return (reject) => run().catch(reject);
        if (prop === "finally") return (fn) => run().finally(fn);
        if (typeof prop === "symbol") return undefined;
        return (...args) => builder(table, [...calls, [prop, args]]);
      },
    }
  );
}

export const adminDb = { from: (table) => builder(table) };
