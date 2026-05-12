// Teya SecurePay helper for The Private Space.
// Mirrors the membership pattern: uses the same merchant credentials, but
// directs return URLs to /private-space/pay/* outcome pages.
//
// Required env (additive):
//   SALTPAY_PRIVATE_SPACE_RETURN_URL_SUCCESS         → user-facing success page
//   SALTPAY_PRIVATE_SPACE_RETURN_URL_SUCCESS_SERVER  → server-to-server callback
//   SALTPAY_PRIVATE_SPACE_RETURN_URL_CANCEL          → user cancelled
//   SALTPAY_PRIVATE_SPACE_RETURN_URL_ERROR           → payment failed
//
// Reuses helpers from membershipTeya.js where possible.

import { buildCheckHash, newOrderId, TEYA_SECUREPAY } from "@/lib/membershipTeya";

export function getPrivateSpaceReturnUrls() {
  const baseFromEnv =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
    "https://mama.is";

  return {
    success: process.env.SALTPAY_PRIVATE_SPACE_RETURN_URL_SUCCESS || `${baseFromEnv}/private-space/pay/success`,
    successServer: process.env.SALTPAY_PRIVATE_SPACE_RETURN_URL_SUCCESS_SERVER || `${baseFromEnv}/api/private-space/securepay-callback`,
    cancel: process.env.SALTPAY_PRIVATE_SPACE_RETURN_URL_CANCEL || `${baseFromEnv}/private-space/pay/cancelled`,
    error: process.env.SALTPAY_PRIVATE_SPACE_RETURN_URL_ERROR || `${baseFromEnv}/private-space/pay/error`,
  };
}

/**
 * Build a SecurePay hosted-checkout URL for a Private Space booking.
 * Returns { redirectUrl, orderId } — store orderId on the booking row before
 * redirecting the customer.
 */
export function buildPrivateSpaceCheckoutUrl({ amount, buyerName, buyerEmail, language = "EN", referenceId, savecard = false }) {
  const merchantId = TEYA_SECUREPAY.merchantId();
  const secretKey = TEYA_SECUREPAY.secretKey();
  const paymentGatewayId = TEYA_SECUREPAY.paymentGatewayId();
  const baseUrl = TEYA_SECUREPAY.baseUrl();
  const returns = getPrivateSpaceReturnUrls();

  const missing = [];
  if (!merchantId) missing.push("SALTPAY_MERCHANT_ID");
  if (!secretKey) missing.push("SALTPAY_SECRET_KEY");
  if (!paymentGatewayId) missing.push("SALTPAY_PAYMENT_GATEWAY_ID");
  if (!baseUrl) missing.push("SALTPAY_BASE_URL");
  if (missing.length) {
    throw new Error(`Missing Teya env vars: ${missing.join(", ")}`);
  }

  const orderId = newOrderId(); // 12-char hex
  const amountStr = Number(amount).toFixed(2);

  const checkHash = buildCheckHash({
    merchantId,
    returnUrlSuccess: returns.success,
    returnUrlSuccessServer: returns.successServer,
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
    language: language === "IS" || language === "is" ? "IS" : "EN",
    returnurlsuccess: returns.success,
    returnurlsuccessserver: returns.successServer,
    returnurlcancel: returns.cancel,
    returnurlerror: returns.error,
    buyername: buyerName || "",
    buyeremail: buyerEmail || "",
    itemdescription_1: `The Private Space · ${referenceId}`,
    itemcount_1: "1",
    itemunitamount_1: amountStr,
    itemamount_1: amountStr,
  };

  // For recurring bookings: ask Teya to save the card for future MIT charges.
  if (savecard) {
    form.savecard = "true";
  }

  // Build redirect URL with form-encoded query string
  const params = new URLSearchParams(form);
  const redirectUrl = `${baseUrl.replace(/\/+$/, "")}/SecurePayment.aspx?${params.toString()}`;

  return { redirectUrl, orderId };
}
