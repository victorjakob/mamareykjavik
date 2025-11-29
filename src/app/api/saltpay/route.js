import crypto from "crypto";
import { createServerSupabase } from "@/util/supabase/server";
import {
  calculateTicketsSold,
  canPurchaseTickets,
} from "@/util/event-capacity-util";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      amount,
      eventId,
      items,
      buyer_email,
      buyer_name,
      quantity,
      event_coupon,
    } = body;

    // Get unit price from items array
    const unitPrice = items[0].unitPrice;

    // Check capacity before creating ticket
    const supabaseClient = createServerSupabase();
    
    // Fetch event with capacity
    const { data: event, error: eventError } = await supabaseClient
      .from("events")
      .select("id, capacity, sold_out")
      .eq("id", eventId)
      .single();

    if (eventError) throw eventError;

    // Fetch existing tickets to calculate sold tickets
    const { data: tickets, error: ticketsError } = await supabaseClient
      .from("tickets")
      .select("quantity, status")
      .eq("event_id", eventId);

    if (ticketsError) throw ticketsError;

    const ticketsSold = calculateTicketsSold(tickets || []);
    const purchaseCheck = canPurchaseTickets(event, ticketsSold, quantity);

    if (!purchaseCheck.canPurchase) {
      return new Response(
        JSON.stringify({ message: purchaseCheck.reason || "Event is sold out" }),
        { status: 400 }
      );
    }

    // Generate a random 12 character order ID
    const orderId = crypto.randomBytes(6).toString("hex");

    // Create pending ticket in database
    const { error: ticketError } = await supabaseClient.from("tickets").insert({
      order_id: orderId,
      event_id: eventId,
      status: "pending",
      buyer_email: buyer_email,
      buyer_name: buyer_name,
      quantity: quantity,
      price: unitPrice, // Store unit price instead of total amount
      total_price: amount, // Store total price
      ticket_variant_id: items[0].ticket_variant_id || null,
      variant_name: items[0].ticket_variant_name || null,
      event_coupon: event_coupon || null,
    });

    if (ticketError) throw ticketError;

    const merchantId = process.env.SALTPAY_MERCHANT_ID;
    const secretKey = process.env.SALTPAY_SECRET_KEY;
    const paymentGatewayId = process.env.SALTPAY_PAYMENT_GATEWAY_ID;
    const baseUrl = process.env.SALTPAY_BASE_URL;

    const returnUrlSuccess = process.env.SALTPAY_RETURN_URL_SUCCESS;
    const returnUrlSuccessServer =
      process.env.SALTPAY_RETURN_URL_SUCCESS_SERVER;

    const returnUrlCancel = process.env.SALTPAY_RETURN_URL_CANCEL;
    const returnUrlError = process.env.SALTPAY_RETURN_URL_ERROR;

    // Validate URLs
    [returnUrlSuccess, returnUrlCancel, returnUrlError].forEach((url) => {
      try {
        new URL(url);
      } catch {
        throw new Error(`Invalid URL: ${url}`);
      }
    });

    // Generate HMAC `checkhash`
    const checkHashMessage = `${merchantId}|${returnUrlSuccess}|${returnUrlSuccessServer}|${orderId}|${amount.toFixed(
      2
    )}|ISK`;
    const checkHash = crypto
      .createHmac("sha256", secretKey)
      .update(checkHashMessage, "utf8")
      .digest("hex");

    const formData = {
      amount: amount.toFixed(2),
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
      buyername: buyer_name,
      buyeremail: buyer_email,
      itemdescription_0: items[0].description,
      itemcount_0: items[0].count,
      itemunitamount_0: items[0].unitPrice.toFixed(2),
      itemamount_0: items[0].totalPrice.toFixed(2),
    };

    return new Response(
      JSON.stringify({
        url: `${baseUrl}?${new URLSearchParams(formData).toString()}`,
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
