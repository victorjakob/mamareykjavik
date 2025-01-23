import crypto from "crypto";

export async function POST(req) {
  try {
    const body = await req.json();
    const { amount, currency, orderId, buyer, items = [] } = body;

    // Validate required fields
    if (!amount || !currency || !orderId || !buyer?.name || !buyer?.email) {
      return new Response(
        JSON.stringify({ message: "Missing or invalid required fields" }),
        { status: 400 }
      );
    }

    // Validate `orderId` length (12 alphanumeric characters)
    if (!/^[a-zA-Z0-9]{12}$/.test(orderId)) {
      return new Response(
        JSON.stringify({
          message: "OrderId must be exactly 12 alphanumeric characters.",
        }),
        { status: 400 }
      );
    }

    const merchantId = "9256684";
    const secretKey = "cdedfbb6ecab4a4994ac880144dd92dc";
    const paymentGatewayId = "7";
    const baseUrl = "https://test.borgun.is/SecurePay/default.aspx";

    const returnUrlSuccess = "http://mamareykjavik.is";
    const returnUrlCancel = "http://whitelotus.is";
    const returnUrlError = "http://google.com";

    // Validate URLs
    [returnUrlSuccess, returnUrlCancel, returnUrlError].forEach((url) => {
      try {
        new URL(url); // Validate URL format
      } catch {
        throw new Error(`Invalid URL: ${url}`);
      }
    });

    // Generate HMAC `checkhash`
    const checkHashMessage = `${merchantId}|${returnUrlSuccess}|${returnUrlSuccess}|${orderId}|${amount.toFixed(
      2
    )}|${currency}`;
    const checkHash = crypto
      .createHmac("sha256", secretKey)
      .update(checkHashMessage, "utf8")
      .digest("hex");

    // Construct dynamic cart data (optional)
    const cartData = items.reduce((fields, item, index) => {
      fields[`itemdescription_${index}`] = item.description || "";
      fields[`itemcount_${index}`] = item.count || 1;
      fields[`itemunitamount_${index}`] = item.unitAmount.toFixed(2) || "0.00";
      fields[`itemamount_${index}`] = item.amount.toFixed(2) || "0.00";
      return fields;
    }, {});

    const formData = {
      amount: amount.toFixed(2),
      merchantid: merchantId,
      paymentgatewayid: paymentGatewayId,
      checkhash: checkHash,
      orderid: orderId,
      currency: currency.toUpperCase(),
      language: "EN",
      returnurlsuccess: returnUrlSuccess,
      returnurlcancel: returnUrlCancel,
      returnurlerror: returnUrlError,
      buyername: buyer.name,
      buyeremail: buyer.email,
      ...cartData, // Include optional cart fields
    };

    // Log all data for debugging
    console.log("SaltPay Form Data:", formData);

    return new Response(
      JSON.stringify({
        action: baseUrl,
        fields: formData,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}
