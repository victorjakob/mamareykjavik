import { NextResponse } from "next/server";

// The till calls these from a static app on a tablet, behind its own bearer
// token, as every /api/pos route does.
export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export const json = (body, init = {}) =>
  NextResponse.json(body, { ...init, headers: { ...CORS, ...(init.headers ?? {}) } });

export const options = () => new NextResponse(null, { status: 204, headers: CORS });

export function authorised(request) {
  const key = process.env.POS_API_KEY;
  if (!key) return false;
  return (request.headers.get("authorization") ?? "") === `Bearer ${key}`;
}
