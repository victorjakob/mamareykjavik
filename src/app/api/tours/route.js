// app/api/tours/route.js
//
// Creates a tour booking and returns the Teya/SaltPay redirect URL.
// The price is computed SERVER-SIDE from the tour's price × tickets —
// never trust an amount coming from the client.

import { createServerSupabase } from "@/util/supabase/server";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { spotsLeft, SESSION_WITH_BOOKINGS_SELECT } from "@/lib/tourAvailability";

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
      notes,
    } = body;

    const tickets = parseInt(number_of_tickets, 10);

    if (
      !tour_session_id ||
      !customer_name ||
      !customer_email ||
      !customer_phone ||
      !Number.isInteger(tickets) ||
      tickets < 1
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Load session + bookings + parent tour — price and availability both
    // come from the database, not the request.
    const { data: session, error: sessionError } = await supabase
      .from("tour_sessions")
      .select(`${SESSION_WITH_BOOKINGS_SELECT}, tours:tour_id (id, name, price, is_active)`)
      .eq("id", tour_session_id)
      .single();

    if (sessionError || !session || !session.tours) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (session.tours.is_active === false) {
      return NextResponse.json(
        { error: "This tour is not currently bookable" },
        { status: 400 }
      );
    }
    if (new Date(session.start_time) <= new Date()) {
      return NextResponse.json(
        { error: "This departure has already left" },
        { status: 400 }
      );
    }

    const remaining = spotsLeft(session);
    if (tickets > remaining) {
      return NextResponse.json(
        {
          error:
            remaining === 0
              ? "This departure is fully booked"
              : `Only ${remaining} spot${remaining === 1 ? "" : "s"} left on this departure`,
        },
        { status: 409 }
      );
    }

    const total_amount = session.tours.price * tickets;

    // Generate a random 12 character order ID
    const orderId = crypto.randomBytes(6).toString("hex");

    const { data, error } = await supabase
      .from("tour_bookings")
      .insert({
        tour_session_id,
        customer_name,
        customer_email,
        customer_phone,
        number_of_tickets: tickets,
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
    [
      returnUrlSuccess,
      returnUrlSuccessServer,
      returnUrlCancel,
      returnUrlError,
    ].forEach((url) => {
      try {
        new URL(url);
      } catch {
        throw new Error(`Invalid URL: ${url}`);
      }
    });

    // Generate HMAC `checkhash`
    const checkHashMessage = `${merchantId}|${returnUrlSuccess}|${returnUrlSuccessServer}|${orderId}|${total_amount.toFixed(
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
      returnurlsuccessserver: returnUrlSuccessServer,
      returnurlcancel: returnUrlCancel,
      returnurlerror: returnUrlError,
      buyername: customer_name,
      buyeremail: customer_email,
      itemdescription_0: `${session.tours.name} - ${tickets} ticket${
        tickets === 1 ? "" : "s"
      }`,
      itemcount_0: tickets,
      itemunitamount_0: session.tours.price.toFixed(2),
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
