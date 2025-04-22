import { createServerSupabase } from "@/util/supabase/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request) {
  try {
    const supabase = createServerSupabase();
    const body = await request.json();
    const {
      tour_session_id,
      customer_name,
      customer_email,
      customer_phone,
      number_of_tickets,
      total_amount,
      notes,
    } = body;

    if (
      !tour_session_id ||
      !customer_name ||
      !customer_email ||
      !customer_phone ||
      !number_of_tickets ||
      !total_amount
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a random 12 character order ID
    const orderId = crypto.randomBytes(6).toString("hex");

    // Insert the booking directly into the tour_bookings table
    const { data, error } = await supabase
      .from("tour_bookings")
      .insert({
        tour_session_id,
        customer_name,
        customer_email,
        customer_phone,
        number_of_tickets,
        total_amount,
        payment_status: "pending",
        notes,
        order_id: orderId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating booking:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create booking" },
        { status: 500 }
      );
    }

    // Initialize SaltPay payment
    const merchantId = process.env.SALTPAY_MERCHANT_ID;
    const secretKey = process.env.SALTPAY_SECRET_KEY;
    const paymentGatewayId = process.env.SALTPAY_PAYMENT_GATEWAY_ID;
    const baseUrl = process.env.SALTPAY_BASE_URL;

    const baseReturnUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseReturnUrl) {
      throw new Error("NEXT_PUBLIC_BASE_URL environment variable is not set");
    }

    const returnUrlSuccess = process.env.SALTPAY_TOURS_RETURN_URL_SUCCESS;
    const returnUrlCancel = process.env.SALTPAY_TOURS_RETURN_URL_CANCEL;
    const returnUrlError = process.env.SALTPAY_TOURS_RETURN_URL_ERROR;
    const returnUrlSuccessServer =
      process.env.SALTPAY_TOURS_RETURN_URL_SUCCESS_SERVER;

    // Validate URLs
    [returnUrlSuccess, returnUrlCancel, returnUrlError].forEach((url) => {
      try {
        new URL(url);
      } catch {
        throw new Error(`Invalid URL: ${url}`);
      }
    });

    // Generate HMAC `checkhash`
    const checkHashMessage = `${merchantId}|${returnUrlSuccess}|${returnUrlSuccess}|${orderId}|${total_amount.toFixed(
      2
    )}|ISK`;
    const checkHash = crypto
      .createHmac("sha256", secretKey)
      .update(checkHashMessage, "utf8")
      .digest("hex");

    const formData = {
      amount: total_amount.toFixed(2),
      merchantid: merchantId,
      paymentgatewayid: paymentGatewayId,
      checkhash: checkHash,
      orderid: orderId,
      currency: "ISK",
      language: "EN",
      returnurlsuccess: returnUrlSuccess,
      returnurlcancel: returnUrlCancel,
      returnurlerror: returnUrlError,
      returnurlsuccessserver: returnUrlSuccessServer,
      buyername: customer_name,
      buyeremail: customer_email,
      itemdescription_0: `Tour Booking - ${number_of_tickets} tickets`,
      itemcount_0: number_of_tickets,
      itemunitamount_0: (total_amount / number_of_tickets).toFixed(2),
      itemamount_0: total_amount.toFixed(2),
    };

    return NextResponse.json({
      booking: data,
      paymentUrl: `${baseUrl}?${new URLSearchParams(formData).toString()}`,
    });
  } catch (error) {
    console.error("Error in booking API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
