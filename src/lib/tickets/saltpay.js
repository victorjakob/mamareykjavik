// SaltPay / Teya hosted payment page helpers for event tickets.
// (Swap this file for the Borgun adapter when that goes live.)

import crypto from "crypto";

export function buildTicketPaymentUrl({
  orderId,
  amount,
  buyerName,
  buyerEmail,
  description,
  count,
  unitPrice,
}) {
  const merchantId = process.env.SALTPAY_MERCHANT_ID;
  const secretKey = process.env.SALTPAY_SECRET_KEY;
  const paymentGatewayId = process.env.SALTPAY_PAYMENT_GATEWAY_ID;
  const baseUrl = process.env.SALTPAY_BASE_URL;
  const returnUrlSuccess = process.env.SALTPAY_RETURN_URL_SUCCESS;
  const returnUrlSuccessServer = process.env.SALTPAY_RETURN_URL_SUCCESS_SERVER;
  const returnUrlCancel = process.env.SALTPAY_RETURN_URL_CANCEL;
  const returnUrlError = process.env.SALTPAY_RETURN_URL_ERROR;

  [returnUrlSuccess, returnUrlCancel, returnUrlError].forEach((url) => {
    try {
      new URL(url);
    } catch {
      throw new Error(`Invalid URL: ${url}`);
    }
  });

  const amountStr = Number(amount).toFixed(2);
  const checkHash = crypto
    .createHmac("sha256", secretKey)
    .update(
      `${merchantId}|${returnUrlSuccess}|${returnUrlSuccessServer}|${orderId}|${amountStr}|ISK`,
      "utf8"
    )
    .digest("hex");

  const formData = {
    amount: amountStr,
    merchantid: merchantId,
    paymentgatewayid: paymentGatewayId,
    checkhash: checkHash,
    orderid: orderId,
    currency: "ISK",
    language: "EN",
    returnurlsuccess: returnUrlSuccess,
    returnurlsuccessserver: returnUrlSuccessServer,
    returnurlcancel: returnUrlCancel,
    returnurlerror: returnUrlError,
    buyername: buyerName,
    buyeremail: buyerEmail,
    itemdescription_0: description,
    itemcount_0: count,
    itemunitamount_0: Number(unitPrice).toFixed(2),
    itemamount_0: amountStr,
  };

  return `${baseUrl}?${new URLSearchParams(formData).toString()}`;
}

/** Constant-time check of the gateway's orderhash on a callback. */
export function verifyOrderHash({ orderid, amount, currency, orderhash }) {
  const secretKey = process.env.SALTPAY_SECRET_KEY;
  if (!secretKey || !orderhash) return false;
  const expected = crypto
    .createHmac("sha256", secretKey)
    .update(`${orderid}|${amount}|${currency}`, "utf8")
    .digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(String(orderhash), "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
