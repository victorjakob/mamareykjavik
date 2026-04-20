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
// Auth is HTTP Basic. The exact encoding — `base64(private)`, `base64(:private)`,
// or `base64(public:private)` — isn't stated in the Swagger spec. We default to
// `base64(public:private)` because Teya emits both tokens as a pair and this is
// the most common pattern; SALTPAY_RPG_AUTH_MODE can override if Teya later
// confirms a different format. See buildRpgAuthHeader() below.
//
// Base URL patterns:
//   Test:       https://test.borgun.is/rpg
//   Production: https://gw.borgun.is/rpg   (confirm with Teya before go-live)
export const TEYA_RPG = {
  baseUrl:     () => (process.env.SALTPAY_RPG_BASE_URL || "").replace(/\/+$/, ""),
  publicKey:   () => process.env.SALTPAY_RPG_PUBLIC_KEY || "",
  privateKey:  () => process.env.SALTPAY_RPG_PRIVATE_KEY || "",
  authMode:    () => (process.env.SALTPAY_RPG_AUTH_MODE || "basic_pair").toLowerCase(),
};

// Build the Authorization header for RPG requests.
// Supports three plausible encodings so we can flip via env without redeploying:
//   basic_pair    — Basic base64("publicKey:privateKey")  (default)
//   basic_private — Basic base64("privateKey")
//   basic_private_colon — Basic base64("privateKey:")
function buildRpgAuthHeader() {
  const pub  = TEYA_RPG.publicKey();
  const priv = TEYA_RPG.privateKey();
  const mode = TEYA_RPG.authMode();
  let raw;
  switch (mode) {
    case "basic_private":        raw = priv; break;
    case "basic_private_colon":  raw = `${priv}:`; break;
    case "basic_pair":
    default:                     raw = `${pub}:${priv}`; break;
  }
  return "Basic " + Buffer.from(raw, "utf8").toString("base64");
}

// ─── OrderID helper ──────────────────────────────────────────────────────────

// Teya constraint: orderid is max 12 alphanumeric characters, extended charset
// not allowed. 6 random bytes → 12 hex chars = perfect.
export function newOrderId() {
  return crypto.randomBytes(6).toString("hex");
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
  const amountMinor = Math.round(Number(amountIsk) * 100);
  const payload = {
    TransactionType: "Sale",
    Amount: amountMinor,
    Currency: "ISK",
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
