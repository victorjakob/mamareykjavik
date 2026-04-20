// /api/membership/rpg-3ds-return
// -----------------------------------------------------------------------------
// TermUrl target for Teya's 3DSecure dance. After the cardholder finishes the
// ACS challenge, the ACS posts PaRes + MD back to this URL. We render a
// minimal HTML page that:
//
//   1. Posts the PaRes + MD up to the parent window via postMessage.
//   2. Shows a simple "Verifying…" status while the parent calls rpg-verify.
//
// We never try to validate PaRes on this route — that happens in rpg-verify,
// which also runs the final /api/payment charge.
//
// Security notes:
//   - postMessage targets `window.location.origin`, so a foreign page can't
//     sniff the PaRes.
//   - PaRes is an opaque 3DS blob — it is bound to a single ACS transaction
//     and useless on its own; even so we keep it off query params.
//   - If this page loads outside an iframe (rare — happens when the ACS
//     decides not to frame-break our response), we show a fallback link to
//     return to /membership.
//
// Accepts both POST (the normal ACS path) and GET (occasional fallback) so
// the same URL works if an ACS appends PaRes as query params.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function readInputs(req) {
  const url = new URL(req.url);
  const params = {
    PaRes: url.searchParams.get("PaRes"),
    CRes:  url.searchParams.get("CRes"),
    MD:    url.searchParams.get("MD"),
  };

  if (req.method === "POST") {
    const ct = (req.headers.get("content-type") || "").toLowerCase();
    try {
      if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
        const form = await req.formData();
        params.PaRes = form.get("PaRes") || params.PaRes;
        params.CRes  = form.get("CRes")  || params.CRes;
        params.MD    = form.get("MD")    || params.MD;
      } else if (ct.includes("application/json")) {
        const j = await req.json();
        params.PaRes = j.PaRes || j.pares || params.PaRes;
        params.CRes  = j.CRes  || j.cres  || params.CRes;
        params.MD    = j.MD    || j.md    || params.MD;
      } else {
        // Teya most commonly sends x-www-form-urlencoded, but some proxies
        // strip the header. Try formData regardless.
        try {
          const form = await req.formData();
          params.PaRes = form.get("PaRes") || params.PaRes;
          params.CRes  = form.get("CRes")  || params.CRes;
          params.MD    = form.get("MD")    || params.MD;
        } catch { /* fall through, leave null */ }
      }
    } catch {
      // Swallow — the HTML we render below will show a friendly error if
      // PaRes ended up null.
    }
  }
  return {
    paRes: params.PaRes || null,
    cRes:  params.CRes  || null,
    md:    params.MD    || null,
  };
}

function htmlFor({ paRes, cRes, md, origin }) {
  // base64 blobs are big — we send via postMessage, not URL, so no size cap.
  // Escape for safe embedding in a JSON string literal inside a script tag:
  const safe = (v) => (v == null ? null : String(v))
    ?.replace(/\\/g, "\\\\")
    ?.replace(/"/g, '\\"')
    ?.replace(/<\/script>/gi, "<\\/script>") // paranoid HTML-break guard
    ?.replace(/\r?\n/g, "\\n");

  const safeOrigin = String(origin || "*").replace(/[^a-zA-Z0-9.:/_-]/g, "");
  const ok = Boolean(paRes || cRes);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Verifying — Mama Reykjavík</title>
  <style>
    html, body { margin: 0; padding: 0; background: #fff6ea; color: #2c1810;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { max-width: 360px; text-align: center; }
    h1 { font-family: "Cormorant Garamond", Georgia, serif; font-weight: 300; font-style: italic;
         font-size: 26px; margin: 0 0 8px; }
    p { color: #4a3728; font-size: 14px; line-height: 1.5; margin: 8px 0; }
    .spinner { width: 28px; height: 28px; margin: 12px auto; border: 2px solid #1f5c4b;
               border-right-color: transparent; border-radius: 50%;
               animation: rot 0.8s linear infinite; }
    a { color: #1f5c4b; text-decoration: underline; }
    @keyframes rot { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="spinner" aria-hidden="true"></div>
      <h1>${ok ? "Verifying your card…" : "Something went wrong"}</h1>
      <p>${ok
        ? "Your bank has confirmed the payment. Finalising your membership now."
        : "Your bank did not return an authentication. Please close this window and try again."}</p>
      <noscript>
        <p>Please <a href="/membership">return to the membership page</a> to finish signing up.</p>
      </noscript>
    </div>
  </div>
  <script>
    (function(){
      var payload = {
        type: "mama-rpg-3ds-complete",
        ok: ${ok ? "true" : "false"},
        paRes: ${paRes ? '"' + safe(paRes) + '"' : "null"},
        cRes:  ${cRes  ? '"' + safe(cRes)  + '"' : "null"},
        md:    ${md    ? '"' + safe(md)    + '"' : "null"}
      };
      try {
        // Prefer window.parent (iframe case). Fall back to window.opener
        // (popup case). If we're top-level, navigate to /membership so the
        // user isn't stranded.
        var target = window.parent && window.parent !== window
          ? window.parent
          : (window.opener || null);
        if (target) {
          target.postMessage(payload, ${JSON.stringify(safeOrigin)});
        } else {
          // Top-level fallback — relay via sessionStorage + redirect.
          try { sessionStorage.setItem("mama_rpg_3ds_result", JSON.stringify(payload)); } catch(e) {}
          window.location.replace("/membership?threeds=${ok ? "ok" : "fail"}");
        }
      } catch (err) {
        // Last-ditch fallback: go home.
        window.location.replace("/membership?threeds=${ok ? "ok" : "fail"}");
      }
    })();
  </script>
</body>
</html>`;
}

export async function POST(req) {
  const { paRes, cRes, md } = await readInputs(req);
  const origin = (process.env.NEXTAUTH_URL || req.nextUrl?.origin || "").replace(/\/+$/, "");
  return new NextResponse(htmlFor({ paRes, cRes, md, origin }), {
    status: 200,
    headers: {
      "Content-Type":             "text/html; charset=utf-8",
      "Cache-Control":            "no-store, max-age=0",
      "X-Frame-Options":          "SAMEORIGIN",
      "Referrer-Policy":          "no-referrer",
    },
  });
}

export async function GET(req) {
  // Some ACSs fall back to GET. Same handler.
  return POST(req);
}
