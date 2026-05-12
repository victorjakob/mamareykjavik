// app/api/tours/success-server/route.js
//
// SaltPay payment-success callback for tour bookings. Validates the order
// hash, marks the booking paid, and sends the customer a brand-styled
// confirmation email rendered from the React Email "tour-booking-confirmation"
// template.

import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServerSupabase } from "@/util/supabase/server";
import { createResend } from "@/lib/resend";
import { renderEmail } from "@/emails/render.server";

const resend = createResend();

// CORS preflight
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req) {
  try {
    const supabase = createServerSupabase();

    // Parse SaltPay URL-encoded callback
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);
    const body = Object.fromEntries(params);

    const { status, orderid, amount, currency, orderhash } = body;

    if (status !== "OK") {
      throw new Error("Payment not successful");
    }

    // Validate HMAC
    const secretKey = process.env.SALTPAY_SECRET_KEY;
    const orderHashMessage = `${orderid}|${amount}|${currency}`;
    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(orderHashMessage, "utf8")
      .digest("hex");
    if (calculatedHash !== orderhash) {
      console.error("Order hash validation failed");
      throw new Error("Order hash validation failed");
    }

    // Pull booking + tour metadata
    const { data: bookingData, error: bookingError } = await supabase
      .from("tour_bookings")
      .select(
        `
        *,
        tour_sessions:tour_session_id (
          start_time,
          tours:tour_id (
            name,
            description,
            duration_minutes
          )
        )
      `
      )
      .eq("order_id", orderid)
      .single();

    if (bookingError) {
      console.error("Error fetching booking details:", bookingError);
      throw bookingError;
    }

    // Mark paid
    const { error: updateError } = await supabase
      .from("tour_bookings")
      .update({ payment_status: "paid" })
      .eq("order_id", orderid);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    // Render + send the confirmation
    const { html, text, subject } = await renderEmail("tour-booking-confirmation", {
      customerName: bookingData.customer_name,
      customerEmail: bookingData.customer_email,
      customerPhone: bookingData.customer_phone,
      tourName: bookingData.tour_sessions.tours.name,
      startTime: bookingData.tour_sessions.start_time,
      durationMinutes: bookingData.tour_sessions.tours.duration_minutes,
      numberOfTickets: bookingData.number_of_tickets,
      amount,
      currency,
      notes: bookingData.notes || null,
    });

    await resend.emails.send({
      from: "Mama.is <team@mama.is>",
      replyTo: "team@mama.is",
      to: [bookingData.customer_email],
      subject:
        subject ||
        `Welcome to your ${bookingData.tour_sessions.tours.name}`,
      html,
      text,
    });

    // SaltPay expects an XML acknowledgement
    return new Response("<PaymentNotification>Accepted</PaymentNotification>", {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  } catch (error) {
    console.error("Error in success callback:", error);
    return new Response("<PaymentNotification>Error</PaymentNotification>", {
      status: 400,
      headers: { "Content-Type": "application/xml" },
    });
  }
}
