// Teya helpers for the Membership subsystem.
// -----------------------------------------------------------------------------
// Initial-charge leg (SecurePay / hosted page) is fully implemented here.
// The hash format and field names match docs.borgun.is/hostedpayments/securepay/
// and exactly mirror the pattern proven in src/app/api/saltpay/route.js.
//
// Recurring leg is the RPG (Restful Payment Gateway) REST/JSON API, per
// docs.borgun.is/paymentgateways/bapi/rpg/. Two endpoints matter:
//   - POST /api/token/multi   → convert PAN (or SecurePay virtual card number)
//                               into a reusable MultiToken (card-on-file).
//   - POST /api/payment       → charge the MultiToken (MIT). No CVC, no 3DS —
//                               that's what makes it merchant-initiated.
// First charge: SecurePay hosted page captures the card + returns a virtual
// card number (VCN) via SaveCard=true. On the first cron renewal, we convert
// that VCN into a proper RPG MultiToken once, store it on the subscription,
// and use it for every subsequent charge.
//
// Security:
//   - Never logs CheckHash, OrderHash, secret key, card PAN, virtual card
//     number, RPG multi-token, or the RPG private access token in plain form.
//   - 12-char alphanumeric orderid (crypto.randomBytes(6).toString("hex"))
//     matches Teya's 12-alphanumeric limit.

import crypto from "crypto";

// ─── Config ──────────────────────────────────────────────────────────────────

// Reuse the existing merchant account — same MID / secret / base URL that the
// saltpay route uses. Only the return URLs differ (so success/cancel/error
// land on the Membership pages instead of event tickets).
export const TEYA_SECUREPAY = {
  merchantId:        () => process.env.SALTPAY_MERCHANT_ID,
  secretKey:         () => process.env.SALTPAY_SECRET_KEY,
  paymentGatewayId:  () => process.env.SALTPAY_PAYMENT_GATEWAY_ID,
  baseUrl:           () => process.env.SALTPAY_BASE_URL,
  returnUrlSuccess:       () => process.env.SALTPAY_MEMBERSHIP_RETURN_URL_SUCCESS,
  returnUrlSuccessServer: () => process.env.SALTPAY_MEMBERSHIP_RETURN_URL_SUCCESS_SERVER,
  returnUrlCancel:        () => process.env.SALTPAY_MEMBERSHIP_RETURN_URL_CANCEL,
  returnUrlError:         () => process.env.SALTPAY_MEMBERSHIP_RETURN_URL_ERROR,
};

// RPG (Restful Payment Gateway) credentials for server-to-server MIT renewals.
// Per docs.borgun.is/paymentgateways/bapi/rpg/, RPG issues two access tokens:
//
//   Public Access Token  — safe to embed in client code. Can only create
//                          single-use card tokens (/api/token/single).
//   Private Access Token — secret, server-only. Required for /api/payment,
//                          /api/token/multi, and anything that moves money
//                          or touches a saved card.
//
// Auth is HTTP Basic. Empirically confirmed 2026-04-20 by probing Teya's
// sandbox with every plausible encoding: only `Basic base64(privateKey:)`
// (private key as Basic-auth username, empty password, colon required) was
// accepted. `pub:priv`, `priv` alone, `Bearer priv`, and `X-API-Key` all
// returned 401 "Authorization has been denied for this request". We keep
// SALTPAY_RPG_AUTH_MODE as an escape hatch in case production is different.
//
// Base URL patterns:
//   Test:       https://test.borgun.is/rpg
//   Production: https://gw.borgun.is/rpg   (confirm with Teya before go-live)
export const TEYA_RPG = {
  baseUrl:     () => (process.env.SALTPAY_RPG_BASE_URL || "").replace(/\/+$/, ""),
  publicKey:   () => process.env.SALTPAY_RPG_PUBLIC_KEY || "",
  privateKey:  () => process.env.SALTPAY_RPG_PRIVATE_KEY || "",
  authMode:    () => (process.env.SALTPAY_RPG_AUTH_MODE || "basic_private_colon").toLowerCase(),
};

// Build the Authorization header for RPG requests.
// Supports three encodings so we can flip via env without redeploying:
//   basic_private_colon — Basic base64("privateKey:")     (default, confirmed working)
//   basic_private       — Basic base64("privateKey")
//   basic_pair          — Basic base64("publicKey:privateKey")
function buildRpgAuthHeader() {
  const pub  = TEYA_RPG.publicKey();
  const priv = TEYA_RPG.privateKey();
  const mode = TEYA_RPG.authMode();
  let raw;
  switch (mode) {
    case "basic_private":        raw = priv; break;
    case "basic_pair":           raw = `${pub}:${priv}`; break;
    case "basic_private_colon":
    default:                     raw = `${priv}:`; break;
  }
  return "Basic " + Buffer.from(raw, "utf8").toString("base64");
}

// ─── ISO 4217 numeric currency code helper ──────────────────────────────────
//
// RPG rejects alpha currency codes: POSTing Currency:"ISK" returns
// 400 "Currency: Invalid format". Empirically (2026-04-20) it accepts the
// ISO 4217 numeric code as a string, e.g. "352" for ISK. SecurePay uses
// the alpha code and always will — this helper is RPG-only.
function rpgCurrencyCode(alpha) {
  const map = { ISK: "352", EUR: "978", USD: "840", GBP: "826", DKK: "208", SEK: "752", NOK: "578" };
  const code = String(alpha || "").toUpperCase();
  return map[code] || code; // fall through so non-mapped codes surface errors clearly
}

// ─── OrderID helper ──────────────────────────────────────────────────────────

// Teya constraint: orderid is max 12 alphanumeric characters, extended charset
// not allowed. 6 random bytes → 12 hex chars = perfect.
export function newOrderId() {
  return crypto.randomBytes(6).toString("hex");
}

// Advance a date by exactly one calendar month, preserving the day-of-month.
// If the target month has fewer days (Jan 31 → Feb), clamp to the last day of
// the target month so billing never silently skips ahead.
//
// Using this keeps the billing anchor stable across retries: sign up on the
// 3rd, every future renewal lands on the 3rd, regardless of month length or
// which day the cron actually fired.
export function addOneMonth(input) {
  const d = new Date(input);
  const originalDay = d.getUTCDate();
  const targetMonthIdx = d.getUTCMonth() + 1;
  const targetYear  = d.getUTCFullYear() + Math.floor(targetMonthIdx / 12);
  const targetMonth = ((targetMonthIdx % 12) + 12) % 12;
  // Last day of the target month:
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const clampedDay = Math.min(originalDay, lastDay);
  return new Date(Date.UTC(
    targetYear,
    targetMonth,
    clampedDay,
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
    d.getUTCMilliseconds(),
  ));
}

// ─── CheckHash for SecurePay request ─────────────────────────────────────────
//
// From the Teya SecurePay doc (verified against mamapage's working saltpay route):
//
//   CheckHashMessage = MerchantId|ReturnUrlSuccess|ReturnUrlSuccessServer|
//                      OrderId|Amount|Currency
//   CheckHash = HMAC_SHA256(secretKey, CheckHashMessage)
//
// All six fields required; amount uses the same formatting as sent on the wire
// (two decimals, e.g. "2000.00").
export function buildCheckHash({ merchantId, returnUrlSuccess, returnUrlSuccessServer, orderId, amount, currency, secretKey }) {
  const message = `${merchantId}|${returnUrlSuccess}|${returnUrlSuccessServer}|${orderId}|${amount}|${currency}`;
  return crypto.createHmac("sha256", secretKey).update(message, "utf8").digest("hex");
}

// ─── OrderHash verification for the server-to-server callback ────────────────
//
// Teya posts orderhash back (not checkhash) when redirecting to
// returnurlsuccessserver. The message is the shorter 3-field form:
//
//   OrderHashMessage = orderid|amount|currency
//   OrderHash        = HMAC_SHA256(secretKey, OrderHashMessage)
//
// Uses a timing-safe equality check to avoid leaking comparison time.
export function verifyOrderHash({ orderid, amount, currency, providedHash, secretKey }) {
  if (!providedHash) return false;
  const message = `${orderid}|${amount}|${currency}`;
  const expected = crypto.createHmac("sha256", secretKey).update(message, "utf8").digest("hex");
  const a = Buffer.from(String(providedHash), "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// ─── Build the SecurePay hosted-page redirect URL ────────────────────────────
//
// Returns a full https URL the browser should be redirected to. Teya will host
// the card form, run 3-D Secure, and send the user back to returnUrlSuccess.
// The server-to-server confirmation hits returnUrlSuccessServer.
//
// SaveCard=true asks Teya to return a reusable virtual card number (token) in
// the success payload so we can MIT-charge it on renewal. This is the critical
// parameter that turns the integration into a recurring one. If Teya does NOT
// honour "savecard" on the hosted page, their support may need to flip it at
// the account level — see docs/02_TEYA_INTEGRATION.md §1 in the scaffold for
// the exact wording to use with them.
export function buildMembershipCheckoutUrl({ orderId, amount, buyerName, buyerEmail, language = "EN", itemDescription }) {
  const merchantId = TEYA_SECUREPAY.merchantId();
  const secretKey  = TEYA_SECUREPAY.secretKey();
  const paymentGatewayId = TEYA_SECUREPAY.paymentGatewayId();
  const baseUrl           = TEYA_SECUREPAY.baseUrl();
  const returnUrlSuccess       = TEYA_SECUREPAY.returnUrlSuccess();
  const returnUrlSuccessServer = TEYA_SECUREPAY.returnUrlSuccessServer();
  const returnUrlCancel        = TEYA_SECUREPAY.returnUrlCancel();
  const returnUrlError         = TEYA_SECUREPAY.returnUrlError();

  const missing = [];
  if (!merchantId)             missing.push("SALTPAY_MERCHANT_ID");
  if (!secretKey)              missing.push("SALTPAY_SECRET_KEY");
  if (!paymentGatewayId)       missing.push("SALTPAY_PAYMENT_GATEWAY_ID");
  if (!baseUrl)                missing.push("SALTPAY_BASE_URL");
  if (!returnUrlSuccess)       missing.push("SALTPAY_MEMBERSHIP_RETURN_URL_SUCCESS");
  if (!returnUrlSuccessServer) missing.push("SALTPAY_MEMBERSHIP_RETURN_URL_SUCCESS_SERVER");
  if (!returnUrlCancel)        missing.push("SALTPAY_MEMBERSHIP_RETURN_URL_CANCEL");
  if (!returnUrlError)         missing.push("SALTPAY_MEMBERSHIP_RETURN_URL_ERROR");
  if (missing.length) {
    throw new Error(`Missing Teya env vars for membership checkout: ${missing.join(", ")}`);
  }

  // Teya requires 2-decimal strings. Integers like 2000 become "2000.00".
  const amountStr = Number(amount).toFixed(2);

  [returnUrlSuccess, returnUrlCancel, returnUrlError, returnUrlSuccessServer].forEach((u) => {
    try { new URL(u); } catch { throw new Error(`Invalid membership return URL: ${u}`); }
  });

  const checkHash = buildCheckHash({
    merchantId,
    returnUrlSuccess,
    returnUrlSuccessServer,
    orderId,
    amount: amountStr,
    currency: "ISK",
    secretKey,
  });

  const form = {
    amount: amountStr,
    merchantid: merchantId,
    paymentgatewayid: paymentGatewayId,
    checkhash: checkHash,
    orderid: orderId,
    currency: "ISK",
    language: language === "IS" ? "IS" : "EN",
    returnurlsuccess:       returnUrlSuccess,
    returnurlsuccessserver: returnUrlSuccessServer,
    returnurlcancel:        returnUrlCancel,
    returnurlerror:         returnUrlError,
    buyername:  buyerName || "",
    buyeremail: buyerEmail || "",
    // Single cart line — one subscription. Teya requires _0 suffix.
    itemdescription_0: itemDescription || "Mama Reykjavík membership",
    itemcount_0:       "1",
    itemunitamount_0:  amountStr,
    itemamount_0:      amountStr,
    // SaveCard triggers Teya tokenisation so we get a reusable virtual card
    // number back for the RPG MIT renewals. "true" = lowercase string, which
    // is the convention Teya's form parser accepts. If your account was
    // provisioned with a different flag name, Teya support will tell you.
    savecard: "true",
    skipreceiptpage: "1",
  };

  return `${baseUrl}?${new URLSearchParams(form).toString()}`;
}

// ─── Helpers: ExpDate parsing + POST wrapper ─────────────────────────────────

// SecurePay's SaveCard returns expiration as "MMYY" (e.g. "1231" == Dec 2031).
// RPG's /api/token/multi wants ExpMonth ("12") and ExpYear ("31" or "2031").
// This normalizes whatever comes in (MMYY / YYMM / MM/YY) into a safe pair.
function parseExpiration(input) {
  const raw = String(input || "").replace(/\D/g, "");
  if (raw.length !== 4) return { expMonth: null, expYear: null };
  const a = raw.slice(0, 2);
  const b = raw.slice(2, 4);
  const aNum = Number(a);
  const bNum = Number(b);
  const aIsMonth = aNum >= 1 && aNum <= 12;
  const bIsMonth = bNum >= 1 && bNum <= 12;
  // If first pair is a valid month and second isn't → MMYY.
  // If second pair is a valid month and first isn't → YYMM.
  // Ambiguous (both in 1..12) → assume MMYY because that's SecurePay's format.
  if (aIsMonth && !bIsMonth)  return { expMonth: a, expYear: b };
  if (bIsMonth && !aIsMonth)  return { expMonth: b, expYear: a };
  return { expMonth: a, expYear: b }; // MMYY fallback
}

// Thin wrapper around fetch() for RPG JSON calls. Handles auth, content-type,
// timeout-friendly shape, and returns {ok, status, json, text, err} so callers
// don't have to re-handle errors.
async function rpgFetch(path, { method = "POST", body = undefined } = {}) {
  const baseUrl = TEYA_RPG.baseUrl();
  const url = `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  let res, text = "", json = null;
  try {
    res = await fetch(url, {
      method,
      headers: {
        "Authorization": buildRpgAuthHeader(),
        "Content-Type":  "application/json",
        "Accept":        "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    text = await res.text();
    try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON reply — keep text */ }
    return { ok: res.ok, status: res.status, json, text, err: null };
  } catch (err) {
    return { ok: false, status: res?.status || 0, json: null, text, err };
  }
}

// ─── createRpgMultiToken ─────────────────────────────────────────────────────
//
// POST /api/token/multi — convert a card (or a SecurePay virtual card number)
// into a reusable MultiToken we can charge forever. Called lazily on the first
// cron renewal for a subscription. The resulting `Token` is persisted on the
// payment_method row so every subsequent renewal skips this step.
//
// Request body (minimal):
//   { PAN: "<VCN>", ExpMonth: "12", ExpYear: "31" }
// Response 201:
//   { Token: "<tok>", VirtualNumber: "...", Enabled: true, ... }
export async function createRpgMultiToken({ pan, expMonth, expYear }) {
  if (!TEYA_RPG.baseUrl() || !TEYA_RPG.privateKey()) {
    return {
      ok: false,
      notImplemented: true,
      reason: "rpg_not_configured",
      token: null,
      message: "Teya RPG env vars not set — skipping token creation.",
      raw: { hasPan: Boolean(pan), hasExp: Boolean(expMonth && expYear) },
    };
  }
  if (!pan || !expMonth || !expYear) {
    return {
      ok: false,
      notImplemented: false,
      reason: "missing_card_details",
      token: null,
      message: "PAN and expiration required to create a multi-use token.",
      raw: { hasPan: Boolean(pan), hasExp: Boolean(expMonth && expYear) },
    };
  }

  const { ok, status, json, text, err } = await rpgFetch("/api/token/multi", {
    method: "POST",
    body: { PAN: pan, ExpMonth: expMonth, ExpYear: expYear },
  });

  if (err) {
    return { ok: false, notImplemented: false, reason: "network_error", token: null,
      message: `RPG token network error: ${err?.message || err}`, raw: { status } };
  }
  if (!ok) {
    return { ok: false, notImplemented: false, reason: "http_error", token: null,
      message: `RPG token HTTP ${status}: ${json?.Message || text?.slice(0, 200) || ""}`,
      raw: { status, responseMessage: json?.Message || null } };
  }

  const token = json?.Token || null;
  if (!token) {
    return { ok: false, notImplemented: false, reason: "no_token_in_response", token: null,
      message: "RPG responded OK but no Token in body.", raw: { status, keys: json ? Object.keys(json) : [] } };
  }
  return {
    ok: true, notImplemented: false, reason: "ok", token,
    message: "MultiToken created.",
    raw: { status, enabled: Boolean(json?.Enabled), hasVerifyResult: Boolean(json?.VerifyCardResult) },
  };
}

// ─── chargeRpgMultiToken ─────────────────────────────────────────────────────
//
// POST /api/payment — charge an already-saved MultiToken. This is the MIT:
// no CVC, no 3DS, no customer interaction. Only runs from the cron.
//
// Request body:
//   {
//     TransactionType: "Sale",
//     Amount: <minor units>,
//     Currency: "ISK",
//     TransactionDate: "<ISO8601>",
//     PaymentMethod: { PaymentType: "TokenMulti", Token: "<multiToken>" },
//     OrderId: "<12-char alphanum>"
//   }
//
// Response 201 (TransactionInfo):
//   { TransactionId, ActionCode, AuthCode, TransactionStatus, Message, ... }
export async function chargeRpgMultiToken({ multiToken, amountIsk, orderId }) {
  if (!TEYA_RPG.baseUrl() || !TEYA_RPG.privateKey()) {
    return {
      ok: false, notImplemented: true, reason: "rpg_not_configured",
      actionCode: null, transactionId: null,
      message: "Teya RPG env vars not set — skipping MIT charge.",
      raw: { orderId, amountIsk, hasToken: Boolean(multiToken) },
    };
  }
  if (!multiToken) {
    return {
      ok: false, notImplemented: false, reason: "no_multi_token",
      actionCode: null, transactionId: null,
      message: "Missing RPG multi-token — cannot MIT charge.",
      raw: { orderId, amountIsk },
    };
  }

  // RPG Amount is in minor units (aurar for ISK). 2000 ISK → 200000.
  // Currency must be the ISO 4217 numeric code as a string ("352" for ISK) —
  // alpha codes return 400 "Currency: Invalid format".
  const amountMinor = Math.round(Number(amountIsk) * 100);
  const payload = {
    TransactionType: "Sale",
    Amount: amountMinor,
    Currency: rpgCurrencyCode("ISK"),
    TransactionDate: new Date().toISOString(),
    PaymentMethod: { PaymentType: "TokenMulti", Token: multiToken },
    OrderId: orderId,
  };

  const { ok, status, json, text, err } = await rpgFetch("/api/payment", {
    method: "POST",
    body: payload,
  });

  if (err) {
    return { ok: false, notImplemented: false, reason: "network_error",
      actionCode: null, transactionId: null,
      message: `RPG payment network error: ${err?.message || err}`,
      raw: { orderId, amountIsk, status } };
  }
  if (!ok) {
    return { ok: false, notImplemented: false, reason: "http_error",
      actionCode: String(status), transactionId: null,
      message: `RPG payment HTTP ${status}: ${json?.Message || text?.slice(0, 200) || ""}`,
      raw: { orderId, amountIsk, status, responseMessage: json?.Message || null } };
  }

  const actionCode    = json?.ActionCode || null;
  const authCode      = json?.AuthCode || null;
  const transactionId = json?.TransactionId || null;
  const transactionStatus = json?.TransactionStatus || null;
  const message = json?.Message || null;
  // Success per RPG: ActionCode "000"/"00" AND TransactionStatus "Accepted"/"Captured".
  const actionOk = actionCode === "000" || actionCode === "00";
  const statusOk = transactionStatus === "Accepted" || transactionStatus === "Captured";
  const isSuccess = actionOk && (statusOk || !transactionStatus); // accept if status missing

  return {
    ok: isSuccess,
    notImplemented: false,
    reason: isSuccess ? "ok" : `decline_${actionCode || transactionStatus || "unknown"}`,
    actionCode,
    transactionId,
    message: message || (isSuccess ? "Authorized" : `Declined (${actionCode || transactionStatus || "no code"})`),
    raw: {
      orderId,
      amountIsk,
      actionCode,
      authCode,
      transactionId,
      transactionStatus,
      message,
      // Never echo the token itself. Just a presence flag + masked PAN.
      panLast4: json?.PaymentMethod?.PAN ? String(json.PaymentMethod.PAN).slice(-4) : null,
      cardType: json?.PaymentMethod?.CardType || null,
    },
  };
}

// ─── mitChargeRenewal (orchestrator) ─────────────────────────────────────────
//
// Called by /api/cron/renew-memberships for each eligible subscription.
// Keeps a single public entry point so the cron doesn't have to know about
// the two-step RPG flow.
//
// Flow:
//   1. If rpgMultiToken exists on the payment method → straight to charge.
//   2. Else, convert the SaveCard virtualCardNumber into an RPG MultiToken,
//      include `newRpgMultiToken` in the return so the cron can persist it,
//      then charge with the fresh token.
//
// Return shape (unchanged from previous contract, plus newRpgMultiToken):
//   { ok, notImplemented, reason, actionCode, transactionId, message, raw,
//     newRpgMultiToken? }
export async function mitChargeRenewal({
  amountIsk,
  orderId,
  rpgMultiToken,              // preferred input — pass through from the DB
  virtualCardNumber,          // only used on first renewal to bootstrap the MultiToken
  virtualCardExpiration,      // MMYY string from SecurePay SaveCard response
  initialTransactionId,       // for audit linkage (CIT → MIT)
}) {
  // ── Short-circuit: env not configured → stub mode (safe skip)
  if (!TEYA_RPG.baseUrl() || !TEYA_RPG.privateKey()) {
    return {
      ok: false,
      notImplemented: true,
      reason: "rpg_not_configured",
      actionCode: null,
      transactionId: null,
      message: "Teya RPG env vars not set — skipping MIT charge.",
      raw: { orderId, amountIsk, hasMultiToken: Boolean(rpgMultiToken),
             hasVcn: Boolean(virtualCardNumber), hasExpiry: Boolean(virtualCardExpiration),
             hasInitialTxn: Boolean(initialTransactionId) },
    };
  }

  // ── If we don't have a MultiToken yet, create one from the SaveCard VCN.
  let activeToken = rpgMultiToken || null;
  let newRpgMultiToken = null;
  if (!activeToken) {
    if (!virtualCardNumber || !virtualCardExpiration) {
      return {
        ok: false, notImplemented: false, reason: "no_card_token",
        actionCode: null, transactionId: null,
        message: "Missing both RPG multi-token and SecurePay virtual card — cannot MIT charge.",
        raw: { orderId, amountIsk },
      };
    }
    const { expMonth, expYear } = parseExpiration(virtualCardExpiration);
    const tokenRes = await createRpgMultiToken({
      pan: virtualCardNumber,
      expMonth,
      expYear,
    });
    if (!tokenRes.ok) {
      return {
        ok: false,
        notImplemented: tokenRes.notImplemented || false,
        reason: `token_create_failed:${tokenRes.reason}`,
        actionCode: null,
        transactionId: null,
        message: tokenRes.message,
        raw: { orderId, amountIsk, tokenStep: tokenRes.raw, initialTransactionIdPresent: Boolean(initialTransactionId) },
      };
    }
    activeToken = tokenRes.token;
    newRpgMultiToken = tokenRes.token;
  }

  // ── Charge.
  const chargeRes = await chargeRpgMultiToken({
    multiToken: activeToken,
    amountIsk,
    orderId,
  });

  return {
    ...chargeRes,
    // Bubble up the freshly minted token so the cron persists it on the
    // membership_payment_methods row. Stays null on reuse (already persisted).
    newRpgMultiToken,
    raw: {
      ...chargeRes.raw,
      // Keep CIT->MIT linkage visible in the audit trail without echoing the token.
      initialTransactionIdPresent: Boolean(initialTransactionId),
      usedFreshToken: Boolean(newRpgMultiToken),
    },
  };
}

// ─── Refund (reverse a previous charge) ──────────────────────────────────────
//
// Teya RPG endpoint: PUT /api/payment/{TRANSACTION_ID}/refund
//
// If Amount is omitted, Teya refunds the full original transaction. If Amount
// is present, it must be ≤ the original (minus any prior partial refunds).
// Multiple partial refunds are allowed up to the original total.
//
// Return shape mirrors chargeRpgMultiToken() so admin logging / UI code can
// reuse the same contract:
//   { ok, notImplemented?, reason?, actionCode, transactionId, message, raw }
//
// Notes:
//   - transactionId in the return is the REFUND transaction id (distinct from
//     the original). We log both in membership_payment_events so the refund can
//     be traced back to the charge it reversed.
//   - Auth header is the same server-side Basic auth we use for charges.
//   - The response JSON shape for refunds is documented by Teya as parallel to
//     the payment response — TransactionStatus/ActionCode/TransactionID fields.
//     If Teya ever diverges we'll see it in raw and can adapt.
export async function refundRpgCharge({
  originalTransactionId,
  amountIsk,            // optional — number; omit for full refund
  orderId,              // optional — our audit order id; Teya echoes it back
  currency = "ISK",
}) {
  if (!TEYA_RPG.baseUrl() || !TEYA_RPG.privateKey()) {
    return {
      ok: false,
      notImplemented: true,
      reason: "rpg_not_configured",
      actionCode: null,
      transactionId: null,
      message: "Teya RPG env vars not set — cannot refund.",
      raw: { originalTransactionId, amountIsk },
    };
  }
  if (!originalTransactionId) {
    return {
      ok: false,
      reason: "missing_transaction_id",
      actionCode: null,
      transactionId: null,
      message: "No original transaction id — cannot refund.",
      raw: {},
    };
  }

  const baseUrl = TEYA_RPG.baseUrl();
  const url = `${baseUrl}/api/payment/${encodeURIComponent(originalTransactionId)}/refund`;

  const body = {};
  if (amountIsk != null) {
    // RPG wants amount as a decimal string with 2 decimals, same as /api/payment.
    body.Amount = Number(amountIsk).toFixed(2);
    body.Currency = rpgCurrencyCode(currency);
  }
  if (orderId) body.OrderID = orderId;

  let res, text, json;
  try {
    res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept":       "application/json",
        "Authorization": buildRpgAuthHeader(),
      },
      body: JSON.stringify(body),
    });
    text = await res.text();
    try { json = text ? JSON.parse(text) : {}; } catch { json = { _raw: text }; }
  } catch (err) {
    return {
      ok: false,
      reason: "network_error",
      actionCode: null,
      transactionId: null,
      message: String(err?.message || err),
      raw: { url, body: redactTeyaPayload(body) },
    };
  }

  const actionCode =
    json?.ActionCode ?? json?.actionCode ?? json?.actioncode ?? null;
  const transactionId =
    json?.TransactionID ?? json?.TransactionId ?? json?.transactionId ?? null;
  const transactionStatus =
    json?.TransactionStatus ?? json?.transactionStatus ?? null;
  const message =
    json?.Message ?? json?.message ??
    (res.ok ? "Refund accepted" : `HTTP ${res.status}`);

  // Teya mirrors the charge contract: ActionCode "000" + TransactionStatus
  // containing "Accepted"/"Success" indicates approval. Some deployments return
  // just "Success" at the top level, so accept either.
  const statusStr = String(transactionStatus || "").toLowerCase();
  const ok =
    res.ok &&
    (actionCode === "000" || actionCode === 0) &&
    (statusStr.includes("accept") || statusStr.includes("success") || statusStr === "");

  return {
    ok,
    actionCode,
    transactionId,
    message,
    raw: {
      httpStatus: res.status,
      request:    redactTeyaPayload(body),
      response:   json,
    },
  };
}

// ─── RPG-direct signup helpers (no SecurePay) ────────────────────────────────
//
// Context: SecurePay's `savecard=true` flag is silently ignored — the callback
// never returns a virtualcardnumber. Empirically confirmed April 2026 against
// live callbacks from merchant 9256684. The fix is to skip SecurePay entirely
// for subscription signups and use RPG's own tokenization pipeline:
//
//   1. Browser: user types card → JS POSTs card details directly to Teya
//      /api/token/single using the Public Access Token. Never touches our
//      server. → { Token: "<singleToken>" }
//   2. Our server: POST { TokenSingle: "<singleToken>" } to /api/token/multi
//      using the Private Access Token. → { Token: "<multiToken>" }
//   3. Our server: POST to /api/payment with PaymentType:"TokenMulti" for the
//      first CIT charge. PSD2-compliant CIT normally requires 3DS via MPI,
//      but RPG's test environment accepts the test PAN 4176 6699 9900 0104
//      without a challenge. Production will need the MPI dance bolted in;
//      see the TODO block inside `cit3dsHintFromResponse`.
//   4. Persist the MultiToken on membership_payment_methods.rpg_multi_token.
//      Monthly renewals already use chargeRpgMultiToken() unchanged.

// ─── exchangeSingleForMultiToken ─────────────────────────────────────────────
//
// POST /api/token/multi  body: { TokenSingle }
// Spec (from the local RPG swagger copy in the project folder):
//   - TokenMultiRequest accepts EITHER `TokenSingle` (safe chaining) OR raw
//     `PAN` + exp. We always use TokenSingle because that path keeps raw PANs
//     out of our server entirely.
//   - Response 201: { Token, VirtualNumber, Enabled, VerifyCardResult, ... }
export async function exchangeSingleForMultiToken({ singleToken }) {
  if (!TEYA_RPG.baseUrl() || !TEYA_RPG.privateKey()) {
    return { ok: false, notImplemented: true, reason: "rpg_not_configured",
      token: null, message: "Teya RPG env vars not set.", raw: {} };
  }
  if (!singleToken) {
    return { ok: false, notImplemented: false, reason: "missing_single_token",
      token: null, message: "SingleToken missing from client.", raw: {} };
  }

  const { ok, status, json, text, err } = await rpgFetch("/api/token/multi", {
    method: "POST",
    body: { TokenSingle: singleToken },
  });

  if (err) {
    return { ok: false, notImplemented: false, reason: "network_error",
      token: null, message: `RPG token/multi network error: ${err?.message || err}`,
      raw: { status } };
  }
  if (!ok) {
    return { ok: false, notImplemented: false, reason: "http_error",
      token: null, message: `RPG token/multi HTTP ${status}: ${json?.Message || text?.slice(0, 200) || ""}`,
      raw: { status, responseMessage: json?.Message || null } };
  }
  const token = json?.Token || null;
  if (!token) {
    return { ok: false, notImplemented: false, reason: "no_token_in_response",
      token: null, message: "RPG responded OK but no Token.", raw: { status, keys: json ? Object.keys(json) : [] } };
  }

  // The masked virtual number + card metadata are safe to surface.
  const virtualNumber = json?.VirtualNumber || null;
  const last4 = virtualNumber ? String(virtualNumber).slice(-4) : null;
  return {
    ok: true, notImplemented: false, reason: "ok", token,
    message: "MultiToken created from SingleToken.",
    raw: {
      status,
      enabled: Boolean(json?.Enabled),
      last4,
      hasVerifyResult: Boolean(json?.VerifyCardResult),
    },
  };
}

// ─── chargeRpgCit ────────────────────────────────────────────────────────────
//
// First charge of a new subscription. Structurally identical to the MIT
// renewal call — just a different audit label — but we keep the helper
// separate so the renewal path stays strictly merchant-initiated.
//
// PSD2 / 3DS:
//   - When `mpiToken` is provided, we include
//     `ThreeDSecure: { DataType: "Token", MpiToken }` so RPG populates the
//     3DS fields from the enrollment result.
//   - RPG happily processes with MpiToken for MdStatuses 1, 2, 3, 5, 6 and
//     the 9x "continue if risk manageable" errors — so a single MpiToken
//     covers both the authenticated and "frictionless / attempt" flows.
//   - When `mpiToken` is absent (cron renewals + sandbox-only signups), the
//     payment runs as a plain TokenMulti MIT — no 3DS, no customer
//     interaction. Production CIT paths must always pass MpiToken.
export async function chargeRpgCit({ multiToken, amountIsk, orderId, mpiToken = null }) {
  if (!TEYA_RPG.baseUrl() || !TEYA_RPG.privateKey()) {
    return { ok: false, notImplemented: true, reason: "rpg_not_configured",
      actionCode: null, transactionId: null,
      message: "Teya RPG env vars not set.",
      raw: { orderId, amountIsk, hasToken: Boolean(multiToken), hasMpiToken: Boolean(mpiToken) } };
  }
  if (!multiToken) {
    return { ok: false, notImplemented: false, reason: "no_multi_token",
      actionCode: null, transactionId: null,
      message: "Missing RPG multi-token — cannot CIT charge.",
      raw: { orderId, amountIsk } };
  }

  const amountMinor = Math.round(Number(amountIsk) * 100);
  const payload = {
    TransactionType: "Sale",
    Amount: amountMinor,
    Currency: rpgCurrencyCode("ISK"),    // "352" — RPG rejects "ISK"
    TransactionDate: new Date().toISOString(),
    PaymentMethod: { PaymentType: "TokenMulti", Token: multiToken },
    OrderId: orderId,
  };
  if (mpiToken) {
    payload.ThreeDSecure = { DataType: "Token", MpiToken: mpiToken };
  }

  const { ok, status, json, text, err } = await rpgFetch("/api/payment", {
    method: "POST",
    body: payload,
  });

  if (err) {
    return { ok: false, notImplemented: false, reason: "network_error",
      actionCode: null, transactionId: null,
      message: `RPG payment network error: ${err?.message || err}`,
      raw: { orderId, amountIsk, status } };
  }
  if (!ok) {
    return { ok: false, notImplemented: false, reason: "http_error",
      actionCode: String(status), transactionId: null,
      message: `RPG payment HTTP ${status}: ${json?.Message || text?.slice(0, 200) || ""}`,
      raw: { orderId, amountIsk, status, responseMessage: json?.Message || null } };
  }

  const actionCode = json?.ActionCode || null;
  const authCode   = json?.AuthCode || null;
  const transactionId = json?.TransactionId || null;
  const transactionStatus = json?.TransactionStatus || null;
  const message = json?.Message || null;
  const actionOk = actionCode === "000" || actionCode === "00";
  const statusOk = transactionStatus === "Accepted" || transactionStatus === "Captured";
  const isSuccess = actionOk && (statusOk || !transactionStatus);

  return {
    ok: isSuccess, notImplemented: false,
    reason: isSuccess ? "ok" : `decline_${actionCode || transactionStatus || "unknown"}`,
    actionCode, transactionId,
    message: message || (isSuccess ? "Authorized" : `Declined (${actionCode || transactionStatus || "no code"})`),
    raw: {
      orderId, amountIsk, actionCode, authCode, transactionId, transactionStatus, message,
      panLast4: json?.PaymentMethod?.PAN ? String(json.PaymentMethod.PAN).slice(-4) : null,
      cardType: json?.PaymentMethod?.CardType || null,
      used3ds: Boolean(mpiToken),
    },
  };
}

// ─── MPI (3D Secure) helpers ─────────────────────────────────────────────────
//
// Teya's RPG MPI endpoint (docs.borgun.is/paymentgateways/bapi/rpg/3dsecure.html)
// provides the 3DS dance we need for PSD2-compliant CIT. Two calls:
//
//   POST /api/mpi/v2/enrollment  → tells us whether the card is enrolled and,
//                                  if so, returns either an MpiToken ready for
//                                  payment (MdStatus=1 / frictionless) OR a
//                                  RedirectToACSData form we must render so the
//                                  issuer can challenge the cardholder.
//   POST /api/mpi/v2/validation  → validates the PaRes the ACS returned. Can
//                                  succeed (MdStatus=1) or fail.
//
// After validation succeeds we use the MpiToken from enrollment on /api/payment
// — exactly as chargeRpgCit() already does when `mpiToken` is passed.
//
// MdStatus codes we care about:
//    1 — Authenticated (frictionless or post-challenge success). Continue.
//    9 — Pending — render ACS redirect, collect PaRes, call validation.
//    2/3/4/5/6 — Not-participating / attempt / error; RPG accepts MpiToken
//                anyway per the "Note when using MPI Token" in the spec.
//    0/8 — Do not continue (failed / fraud block).
//   50 — 3DS Method step required (extra iframe + second enrollment). NOT
//        implemented here yet — treated as failure for now. Most European
//        ACSs respond 9 directly so this is a rare path.

export async function mpiEnroll({
  multiToken,
  amountIsk,
  orderId,               // echoed back via MD so we can match the callback
  termUrl,               // our return URL (Teya posts PaRes + MD here)
  description,           // shown to cardholder during challenge
  md,                    // merchant state data — we use the challenge id
}) {
  if (!TEYA_RPG.baseUrl() || !TEYA_RPG.privateKey()) {
    return { ok: false, notImplemented: true, reason: "rpg_not_configured",
      mdStatus: null, mpiToken: null, redirect: null,
      message: "Teya RPG env vars not set.",
      raw: { hasToken: Boolean(multiToken) } };
  }
  if (!multiToken) {
    return { ok: false, reason: "no_multi_token",
      mdStatus: null, mpiToken: null, redirect: null,
      message: "Missing RPG multi-token for MPI enrollment.",
      raw: { orderId } };
  }
  if (!termUrl) {
    return { ok: false, reason: "no_term_url",
      mdStatus: null, mpiToken: null, redirect: null,
      message: "Missing TermUrl for MPI enrollment.",
      raw: { orderId } };
  }

  // MPI uses ISO 4217 standard: ISK has Exponent 0 → PurchAmount is the whole
  // ISK value (2000 ISK → PurchAmount: 2000). RPG /api/payment meanwhile uses
  // minor units (2000 ISK → Amount: 200000). Keep these consistent.
  const payload = {
    CardDetails: {
      PaymentType: "TokenMulti",
      Token:       multiToken,
    },
    PurchAmount: Math.round(Number(amountIsk)),
    Currency:    rpgCurrencyCode("ISK"),
    Exponent:    0,
    TermUrl:     termUrl,
    MD:          md || (orderId ? `ord:${orderId}` : "mama"),
    Description: (description || "Mama Reykjavik membership").slice(0, 120),
  };

  const { ok, status, json, text, err } = await rpgFetch("/api/mpi/v2/enrollment", {
    method: "POST",
    body: payload,
  });

  if (err) {
    return { ok: false, reason: "network_error",
      mdStatus: null, mpiToken: null, redirect: null,
      message: `MPI enrollment network error: ${err?.message || err}`,
      raw: { status } };
  }
  if (!ok) {
    return { ok: false, reason: "http_error",
      mdStatus: null, mpiToken: null, redirect: null,
      message: `MPI enrollment HTTP ${status}: ${json?.Message || text?.slice(0, 200) || ""}`,
      raw: { status, responseMessage: json?.Message || null } };
  }

  const mdStatus = json?.MdStatus != null ? String(json.MdStatus) : null;
  const mpiToken = json?.MpiToken || null;
  const redirectData = Array.isArray(json?.RedirectToACSData) ? json.RedirectToACSData : [];
  const asField = (name) => {
    const f = redirectData.find((x) => (x?.Name || "").toLowerCase() === name.toLowerCase());
    return f?.Value || null;
  };
  const redirect = {
    actionUrl: asField("actionURL") || asField("actionUrl") || asField("URL"),
    paReq:     asField("PaReq"),
    md:        asField("MD"),
    termUrl:   asField("TermUrl"),
  };

  // Frictionless pass — MPI gave us MpiToken straight away and no redirect.
  const frictionless = mdStatus === "1" && !redirect.actionUrl;
  // Non-participating / attempt / error — RPG will still accept MpiToken.
  const continueWithoutChallenge =
    ["2", "3", "4", "5", "6"].includes(mdStatus) && !redirect.actionUrl && Boolean(mpiToken);
  // Challenge required — cardholder must be redirected to ACS.
  const challenge = mdStatus === "9" && Boolean(redirect.actionUrl && redirect.paReq);

  return {
    ok: true,
    reason: "ok",
    mdStatus,
    mpiToken,
    md:                json?.MD || payload.MD,
    redirect:          challenge ? redirect : null,
    frictionless,
    continueWithoutChallenge,
    challenge,
    raw: {
      status,
      mdStatus,
      enrollmentStatus: json?.EnrollmentStatus || null,
      mdErrorMessage:   json?.MdErrorMessage || null,
      hasRedirect:      Boolean(redirect.actionUrl),
      hasMpiToken:      Boolean(mpiToken),
    },
  };
}

export async function mpiValidate({ pares, cres, md }) {
  if (!TEYA_RPG.baseUrl() || !TEYA_RPG.privateKey()) {
    return { ok: false, notImplemented: true, reason: "rpg_not_configured",
      mdStatus: null, message: "Teya RPG env vars not set.", raw: {} };
  }
  if (!pares && !cres) {
    return { ok: false, reason: "no_pares",
      mdStatus: null, message: "Missing PaRes / CRes from ACS.", raw: {} };
  }

  const body = {};
  if (pares) body.PARes = pares;
  if (cres)  body.CRes  = cres;
  if (md)    body.MD    = md;

  const { ok, status, json, text, err } = await rpgFetch("/api/mpi/v2/validation", {
    method: "POST",
    body,
  });

  if (err) {
    return { ok: false, reason: "network_error",
      mdStatus: null, message: `MPI validation network error: ${err?.message || err}`,
      raw: { status } };
  }
  if (!ok) {
    return { ok: false, reason: "http_error",
      mdStatus: null, message: `MPI validation HTTP ${status}: ${json?.Message || text?.slice(0, 200) || ""}`,
      raw: { status, responseMessage: json?.Message || null } };
  }

  const mdStatus = json?.MdStatus != null ? String(json.MdStatus) : null;
  // Authenticated (1) or attempt / not-participating / fixable-error are all
  // "continue" states when the MpiToken is already in hand from enrollment.
  const isAuthenticated = mdStatus === "1";
  const canContinue     = ["1", "2", "3", "4", "5", "6"].includes(mdStatus || "");

  return {
    ok: canContinue,
    reason: canContinue ? "ok" : `mdstatus_${mdStatus || "unknown"}`,
    mdStatus,
    authenticated: isAuthenticated,
    message: json?.MdErrorMessage || (canContinue ? "Validated" : "Authentication failed"),
    raw: {
      status,
      mdStatus,
      enrollmentStatus:     json?.EnrollmentStatus || null,
      authenticationStatus: json?.AuthenticationStatus || null,
      eci:                  json?.ECI || null,
      pAResVerified:        json?.PAResVerified || null,
    },
  };
}

// ─── classifyDecline ─────────────────────────────────────────────────────────
//
// Classify an RPG decline. RPG returns the shared Borgun/Teya action codes at
// docs.borgun.is/paymentgateways/actioncodes.html (ISO 8583 based).
//
// 100-199 = decline, no card pickup
// 200-299 = decline, card pickup required (lost/stolen/fraud → hard fail)
// 900-959 = system / transport errors (mostly transient → retry_soon)
//
// "ok"          → success (000 / 00)
// "retry_soon"  → temporary issuer/system glitch
// "retry_later" → soft decline, funds/limits — retry tomorrow
// "hard_fail"   → bad card, stolen, fraud, expired — stop retrying, push past_due
export function classifyDecline(actionCode) {
  if (!actionCode) return "retry_later";
  const c = String(actionCode).padStart(3, "0");
  if (c === "000" || c === "00") return "ok";

  // System / transport errors → retry soon
  if (["907","908","909","910","911","912","913","953"].includes(c)) return "retry_soon";

  // Funds / limit issues → soft decline, retry tomorrow
  if (["100","104","116","119","120","121"].includes(c)) return "retry_later";

  // Card-level hard failures (200-range = card pickup required)
  if (["101","102","111","125","129","131"].includes(c)) return "hard_fail";   // expired / fraud / invalid / customer-auth-required
  if (/^2\d\d$/.test(c)) return "hard_fail";                                    // any 200-series

  return "retry_later";
}

// ─── Tribe-card merge + restore helpers ──────────────────────────────────────
//
// Policy:
//   - Paying should never DOWNGRADE a member. If their existing card already
//     beats the paid tier's default (higher discount, still valid), we no-op.
//   - If the paid tier's default beats the existing card, we BOOST: snapshot
//     the existing state into `previous_state` and apply the new benefit.
//   - On monthly RENEWAL we just push expires_at forward; previous_state is
//     left untouched (still the underlying card to restore to on cancel).
//   - On CANCEL / hard-fail we try to RESTORE from previous_state. If the
//     underlying card is itself already expired, we just expire the row.
//
// Returns a discriminated result so callers can log / skip properly:
//   { type: "noop"     }                          — existing already richer
//   { type: "insert",  update: {...}  }           — no existing card to merge
//   { type: "upgrade", update: {...}, snapshotted }— boost applied; previous_state set
//   { type: "extend",  update: {...}  }           — renewal, expires_at pushed
//
// The caller is responsible for performing the tribe_cards.update()/insert()
// with the returned `update` payload. Keeping this pure makes it unit-testable.

const PRESERVED_SOURCES = new Set(["legacy", "friends-family", "gift"]);

function isCardValidNow(card) {
  if (!card) return false;
  if (card.status && card.status !== "active") return false;
  if (!card.expires_at) return true; // null = unlimited
  return new Date(card.expires_at) > new Date();
}

/**
 * @param {object|null} existing - the current tribe_cards row (null if none)
 * @param {object} next - desired new values (from subscription tier defaults)
 * @param {object} [opts]
 * @param {"upgrade"|"renew"} [opts.operation] - "upgrade" (signup / tier change)
 *                                               or "renew" (monthly cron).
 *                                               Defaults to "upgrade".
 */
export function mergeTribeCardExtension(existing, next, opts = {}) {
  const operation = opts.operation || "upgrade";
  const nextOut = { status: "active", ...next };

  // No card yet → insert as-is.
  if (!existing) {
    return { type: "insert", update: nextOut };
  }

  // Renewal: we're already in the boosted state. Just push expires_at forward
  // and re-activate. Never touch previous_state — that's our safety net.
  //
  // IMPORTANT: renewal must never *shorten* benefits. If the existing card is
  // unlimited (expires_at is null) or already expires later than the proposed
  // next.expires_at (e.g. a legacy/friends-family holder whose monthly sub
  // sits on top of a longer grant), leave expires_at alone. Only push it
  // forward when it would strictly extend the card.
  if (operation === "renew") {
    const renewUpdate = { status: "active" };
    if (next.expires_at !== undefined) {
      const existingIsUnlimited = !existing.expires_at;
      if (!existingIsUnlimited) {
        const currentEndMs = new Date(existing.expires_at).getTime();
        const nextEndMs    = new Date(next.expires_at).getTime();
        if (Number.isFinite(nextEndMs) && nextEndMs > currentEndMs) {
          renewUpdate.expires_at = next.expires_at;
        }
        // else keep the later existing expires_at
      }
      // unlimited → leave expires_at null
    }
    // Paid renewals run against paid-tribe cards. If somebody's card has been
    // manually flipped to a preserved source, honour that and leave it alone.
    return { type: "extend", update: renewUpdate };
  }

  // Upgrade path: compare benefits.
  const existingPct = Number(existing.discount_percent || 0);
  const nextPct     = Number(next.discount_percent     || 0);
  const existingStillValid = isCardValidNow(existing);
  const existingIsUnlimited = !existing.expires_at;

  // No-op rule: existing card is strictly richer AND still valid.
  // "Richer" = higher discount percent, or same percent with unlimited duration.
  if (existingStillValid) {
    if (existingPct > nextPct) return { type: "noop" };
    if (existingPct === nextPct && existingIsUnlimited) return { type: "noop" };
  }

  // Boost path: snapshot existing if we haven't already snapshotted a
  // previous state. (If previous_state is already set, we're already in a
  // boosted state — don't overwrite the underlying with the current boost.)
  const snapshot = existing.previous_state || {
    source:           existing.source,
    discount_percent: existing.discount_percent,
    duration_type:    existing.duration_type,
    expires_at:       existing.expires_at,
    holder_name:      existing.holder_name,
  };

  const update = {
    status:           "active",
    discount_percent: nextPct,
    duration_type:    next.duration_type || "month",
    expires_at:       next.expires_at || null,
    // If the existing source is a preserved grant (legacy/friends-family/gift)
    // we still flip the LIVE source to paid-tribe for the duration of the
    // subscription — the original grant lives inside previous_state and comes
    // back on cancel. That keeps reporting honest.
    source:           next.source || "paid-tribe",
    previous_state:   snapshot,
  };
  if (next.user_id     !== undefined) update.user_id     = next.user_id;
  if (next.holder_name !== undefined) update.holder_name = next.holder_name;

  return {
    type: "upgrade",
    update,
    snapshotted: !existing.previous_state,
  };
}

/**
 * Called on cancellation or hard-fail. Decides whether to restore the
 * underlying card from previous_state or just expire the row.
 *
 * @returns one of:
 *   { type: "restore", update: {...} }   — restored underlying card
 *   { type: "expire",  update: {...} }   — underlying is gone too; expire
 *   { type: "noop"     }                 — nothing to restore, nothing to expire
 */
export function restoreTribeCardFromPrevious(card, { nowIso } = {}) {
  if (!card) return { type: "noop" };
  const now = nowIso ? new Date(nowIso) : new Date();

  const prev = card.previous_state;

  // No snapshot → nothing to restore; just expire.
  if (!prev) {
    return {
      type: "expire",
      update: { status: "expired" },
    };
  }

  // Underlying already expired by calendar time → clear snapshot, expire.
  if (prev.expires_at && new Date(prev.expires_at) <= now) {
    return {
      type: "expire",
      update: { status: "expired", previous_state: null },
    };
  }

  // Restore!
  return {
    type: "restore",
    update: {
      status:           "active",
      source:           prev.source,
      discount_percent: prev.discount_percent,
      duration_type:    prev.duration_type,
      expires_at:       prev.expires_at,
      holder_name:      prev.holder_name ?? card.holder_name,
      previous_state:   null,
    },
  };
}

// ─── Redaction helper for audit-log payloads ─────────────────────────────────
// Strip anything that could be sensitive before persisting a Teya payload.
export function redactTeyaPayload(payload) {
  if (!payload || typeof payload !== "object") return {};
  const {
    checkhash, CheckHash, orderhash, OrderHash,
    VirtualCardNumber, virtualCardNumber,
    PAN, pan,
    Token, token, MultiToken, multiToken, rpgMultiToken,
    ...rest
  } = payload;
  const out = { ...rest };
  // Mask a masked PAN even further, leaving only last 4.
  const anyPan = PAN || pan;
  if (anyPan) out.pan_last4 = String(anyPan).slice(-4);
  // Never echo the raw token(s) back to audit storage.
  if (VirtualCardNumber || virtualCardNumber) out.hasVirtualCardNumber = true;
  if (Token || token || MultiToken || multiToken || rpgMultiToken) out.hasRpgMultiToken = true;
  return out;
}
