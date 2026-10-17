// Payment links: a one-off "pay this amount" URL for a customer, paid by card
// on Teya's SecurePay hosted page (same merchant account as event tickets).
// It's our own equivalent of Teya's app "Greiðslubeiðni", which isn't
// available through the SecurePay API.
//
// Each link is a row in public.payment_links (migration
// 20261017123000_payment_links.sql). The public URL is /pay/<row id>.

import crypto from "crypto";

export const PAYMENT_LINK_DEFAULT_DAYS = 14;
export const PAYMENT_LINK_MAX_AMOUNT = 2_000_000; // ISK, sanity cap
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isPaymentLinkId(id) {
  return UUID_RE.test(String(id || ""));
}

/** Validates admin input; returns { ok, error?, value? }. */
export function parsePaymentLinkInput(body) {
  const amount = Number(String(body?.amount ?? "").replace(/[^\d]/g, ""));
  const reference = String(body?.reference || "").trim().slice(0, 80);
  const name = String(body?.name || "").trim().slice(0, 100);
  const contact = String(body?.contact || "").trim().slice(0, 120);
  const days = Number(body?.days) || PAYMENT_LINK_DEFAULT_DAYS;
  if (!Number.isInteger(amount) || amount <= 0) return { ok: false, error: "Enter an amount in ISK" };
  if (amount > PAYMENT_LINK_MAX_AMOUNT) return { ok: false, error: "Amount is too large" };
  if (!reference) return { ok: false, error: "Enter an order reference" };
  if (!name) return { ok: false, error: "Enter the customer name" };
  if (days < 1 || days > 90) return { ok: false, error: "Expiry must be 1–90 days" };
  const expiresAt = new Date(Date.now() + days * 86400000).toISOString();
  return { ok: true, value: { amount, reference, name, contact, expiresAt } };
}

export function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || ""));
}

/** SecurePay orderid: max 12 alphanumeric chars. "PL" + 10 hex. */
export function newPaymentLinkOrderId() {
  return `PL${crypto.randomBytes(5).toString("hex")}`;
}

export function siteBaseUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL || "https://mama.is").replace(/\/$/, "");
}

export function paymentLinkUrl(id, base = siteBaseUrl()) {
  return `${base}/pay/${id}`;
}

export function paymentLinkReturnUrls(base = siteBaseUrl()) {
  return {
    success: `${base}/api/pay/return/success`,
    successServer: `${base}/api/pay/callback`,
    cancel: `${base}/api/pay/return/cancel`,
    error: `${base}/api/pay/return/error`,
  };
}

/**
 * SecurePay form fields for a payment link (same field set + checkhash format
 * as lib/tickets/saltpay.js buildTicketPaymentUrl; only the return URLs and
 * item text differ). `reference` carries the payment_links row id so the
 * callback can find the row even if the orderid was superseded by a retry.
 */
export function buildPaymentLinkFields({ orderId, link, returnUrls = paymentLinkReturnUrls() }) {
  const merchantId = process.env.SALTPAY_MERCHANT_ID;
  const secretKey = process.env.SALTPAY_SECRET_KEY;
  const paymentGatewayId = process.env.SALTPAY_PAYMENT_GATEWAY_ID;
  if (!merchantId || !secretKey || !paymentGatewayId) {
    throw new Error("SALTPAY_* env vars are not set");
  }
  const amountStr = Number(link.amount_isk).toFixed(2);
  const checkhash = crypto
    .createHmac("sha256", secretKey)
    .update(
      `${merchantId}|${returnUrls.success}|${returnUrls.successServer}|${orderId}|${amountStr}|ISK`,
      "utf8"
    )
    .digest("hex");
  return {
    amount: amountStr,
    merchantid: merchantId,
    paymentgatewayid: paymentGatewayId,
    checkhash,
    orderid: orderId,
    reference: link.id,
    currency: "ISK",
    language: "EN",
    returnurlsuccess: returnUrls.success,
    returnurlsuccessserver: returnUrls.successServer,
    returnurlcancel: returnUrls.cancel,
    returnurlerror: returnUrls.error,
    buyername: link.customer_name,
    buyeremail: isEmail(link.customer_contact) ? link.customer_contact : "",
    itemdescription_0: `Mama Reykjavík: ${link.reference}`.slice(0, 120),
    itemcount_0: 1,
    itemunitamount_0: amountStr,
    itemamount_0: amountStr,
  };
}

export function buildPaymentLinkCheckoutUrl(args) {
  const baseUrl = process.env.SALTPAY_BASE_URL;
  if (!baseUrl) throw new Error("SALTPAY_BASE_URL is not set");
  const fields = buildPaymentLinkFields(args);
  if (!fields.buyeremail) delete fields.buyeremail;
  return `${baseUrl}?${new URLSearchParams(fields).toString()}`;
}

export function isExpired(link) {
  return !!link.expires_at && Date.now() > new Date(link.expires_at).getTime();
}

export function formatIsk(n) {
  return new Intl.NumberFormat("is-IS").format(Math.round(Number(n) || 0));
}
