// Look a company up by its kennitala, for the till: "can I have that on the
// company?" — the name and address come from the Companies Register rather
// than being typed across the counter.
//
// The register is Já Gagnatorg's API (https://gagnatorg.ja.is/docs/skra/v1/).
// Its key must never be in client-side code — Já says so, and sends no CORS
// headers — so the till asks here, behind its own bearer token, and this asks
// Já with JA_API_KEY from the server's environment.
//
// Every lookup is billed per hit. So only a well-formed company kennitala is
// ever sent on, and the till remembers what it has looked up.
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

const json = (body, init = {}) =>
  NextResponse.json(body, { ...init, headers: { ...CORS, ...(init.headers ?? {}) } });

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

function authorised(request) {
  const key = process.env.POS_API_KEY;
  if (!key) return false;
  return (request.headers.get("authorization") ?? "") === `Bearer ${key}`;
}

/** GET /api/pos/company?kt=4308050530 */
export async function GET(request) {
  if (!authorised(request)) return json({ error: "Not authorised" }, { status: 401 });

  const kt = (new URL(request.url).searchParams.get("kt") ?? "").replace(/\D/g, "");
  // Ten digits, and a company's: theirs start 41–71, a person's 01–31. People
  // are not looked up — this key is for the Companies Register only.
  if (kt.length !== 10) return json({ error: "A kennitala is ten digits" }, { status: 400 });
  const day = Number(kt.slice(0, 2));
  if (day < 41 || day > 71) {
    return json({ error: "That is a person's kennitala. Only companies can be looked up." }, { status: 400 });
  }

  const jaKey = process.env.JA_API_KEY;
  if (!jaKey) return json({ error: "Company lookup is not set up yet" }, { status: 503 });

  try {
    const res = await fetch(`https://api.ja.is/skra/v1/businesses/${kt}`, {
      headers: { Authorization: jaKey },
      cache: "no-store",
    });
    if (res.status === 404) return json({ error: "No company has that kennitala" }, { status: 404 });
    if (!res.ok) {
      console.error("ja lookup failed", res.status);
      return json({ error: "The register could not be reached" }, { status: 502 });
    }
    const b = await res.json();
    const address = b.postal_address ?? b.legal_address ?? null;
    return json({
      ok: true,
      kennitala: b.kennitala ?? kt,
      name: b.full_name ?? b.short_name ?? "",
      street: address?.street?.nominative ?? null,
      postalCode: address?.postal_code ?? null,
      town: address?.town?.nominative ?? null,
      vsk: Array.isArray(b.vsk) ? (b.vsk.find((v) => !v.closed)?.vsk_number ?? null) : null,
      deregistered: b.deregistered === true,
    });
  } catch (err) {
    console.error("ja lookup failed", err);
    return json({ error: "The register could not be reached" }, { status: 502 });
  }
}
