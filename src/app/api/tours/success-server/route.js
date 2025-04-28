// app/api/tours/success-server/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServerSupabase } from "@/util/supabase/server";
import sgMail from "@sendgrid/mail";

// Hard-coded tour information
const TOUR_INFO = {
  meeting_point:
    "We meet at MAMA Restaurant, Bankastræti 2, 2nd Floor. Look for your guide wearing a MAMA Tours jacket!",
  what_to_bring:
    "• Comfortable walking shoes\n• Warm and waterproof clothing\n• Camera\n• Appetite for delicious food and beer!",
  included:
    "• 6 unique food tastings\n• 5 craft beer samples\n• Professional local guide\n• Food history and culture commentary\n• Restaurant recommendations",
};

// 1️⃣ Respond to CORS preflight
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
    console.log("Tour success server route called");

    // Parse the body as URL-encoded data
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);
    const body = Object.fromEntries(params);

    const { status, orderid, amount, currency, orderhash } = body;
    console.log("Body:", body);

    if (status !== "OK") {
      throw new Error("Payment not successful");
    }

    // Verify the orderhash
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

    // Get booking details from database
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

    // Update booking status in the database
    const { error: updateError } = await supabase
      .from("tour_bookings")
      .update({ payment_status: "paid" })
      .eq("order_id", orderid);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    const tourDate = new Date(
      bookingData.tour_sessions.start_time
    ).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const tourTime = new Date(
      bookingData.tour_sessions.start_time
    ).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Send confirmation email to customer
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const customerMsg = {
      to: bookingData.customer_email,
      from: process.env.SENDGRID_FROM_MAMA_EMAIL,
      subject: `🌿 Welcome to Your ${bookingData.tour_sessions.tours.name} Adventure`,
      html: `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #ffffff;">
      <!-- Header -->
      <div style="text-align: center; padding: 35px 20px; background-color: #F5F1E3; border-radius: 12px; margin-bottom: 25px;">
        <h1 style="color: #4A5D23; margin: 0; font-size: 26px; font-weight: 600;">Your Journey Awaits</h1>
      </div>

      <!-- Welcome -->
      <div style="margin-bottom: 30px; text-align: center;">
        <h2 style="color: #4A5D23; font-size: 22px; margin: 0 0 15px 0; font-weight: 500;">Dear ${
          bookingData.customer_name
        },</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0;">
          We're delighted to welcome you to our MAMA family! Like Mother Earth herself, we can't wait to share our treasures with you. 
          Get ready for an authentic journey through the heart of Reykjavik.
        </p>
      </div>

      <!-- Tour Details -->
      <div style="background-color: #ffffff; border: 1px solid #D7DBCC; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
        <h3 style="color: #4A5D23; font-size: 20px; margin: 0 0 20px 0; font-weight: 500; text-align: center;">
          🌿 ${bookingData.tour_sessions.tours.name} 🌿
        </h3>
        
        <div style="margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0;">
            <tr>
              <td style="padding: 12px; color: #4A5D23; font-weight: 500; width: 120px;">When:</td>
              <td style="padding: 12px; color: #666;">${tourDate}</td>
            </tr>
            <tr style="background-color: #F5F1E3;">
              <td style="padding: 12px; color: #4A5D23; font-weight: 500;">Time:</td>
              <td style="padding: 12px; color: #666;">${tourTime}</td>
            </tr>
            <tr>
              <td style="padding: 12px; color: #4A5D23; font-weight: 500;">Duration:</td>
              <td style="padding: 12px; color: #666;">${Math.round(
                bookingData.tour_sessions.tours.duration_minutes / 60
              )} hours of exploration</td>
            </tr>
            <tr style="background-color: #F5F1E3;">
              <td style="padding: 12px; color: #4A5D23; font-weight: 500;">Souls:</td>
              <td style="padding: 12px; color: #666;">${
                bookingData.number_of_tickets
              } adventurous spirits</td>
            </tr>
            <tr>
              <td style="padding: 12px; color: #4A5D23; font-weight: 500;">Energy Exchange:</td>
              <td style="padding: 12px; color: #666;">${Math.round(
                amount
              )} ${currency}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Meeting Point -->
      <div style="background-color: #F5F1E3; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
        <h3 style="color: #4A5D23; font-size: 20px; margin: 0 0 15px 0; font-weight: 500;">Where We'll Meet</h3>
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0;">
          Like a warm embrace from Mother Earth, we'll welcome you here:<br><br>
          ${TOUR_INFO.meeting_point}
        </p>
      </div>

      <!-- What's Included -->
      <div style="background-color: #ffffff; border: 1px solid #D7DBCC; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
        <h3 style="color: #4A5D23; font-size: 20px; margin: 0 0 15px 0; font-weight: 500;">Nature's Gifts to You</h3>
        <div style="color: #666; font-size: 16px; line-height: 1.6; white-space: pre-line;">
          ${TOUR_INFO.included}
        </div>
      </div>

      <!-- What to Bring -->
      <div style="background-color: #F5F1E3; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
        <h3 style="color: #4A5D23; font-size: 20px; margin: 0 0 15px 0; font-weight: 500;">Prepare for Your Journey</h3>
        <div style="color: #666; font-size: 16px; line-height: 1.6; white-space: pre-line;">
          To fully embrace this experience, please bring:<br><br>
          ${TOUR_INFO.what_to_bring}
        </div>
      </div>

      <!-- Important Information -->
      <div style="background-color: #ffffff; border: 1px solid #D7DBCC; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
        <h3 style="color: #4A5D23; font-size: 20px; margin: 0 0 15px 0; font-weight: 500;">Wisdom for the Journey</h3>
        <ul style="color: #666; font-size: 16px; line-height: 1.6; margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">Like the rising sun, arrive 10 minutes early to greet the day together</li>
          <li style="margin-bottom: 8px;">Nature's moods are ever-changing - dress in harmony with the elements</li>
          <li style="margin-bottom: 8px;">Should your path change, let us know 24 hours before</li>
          <li style="margin-bottom: 8px;">Look for your guide in their MAMA Tours jacket, ready to share Earth's stories</li>
          <li>Bring your camera to capture nature's precious moments</li>
        </ul>
      </div>

      <!-- Contact Information -->
      <div style="background-color: #F5F1E3; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
        <h3 style="color: #4A5D23; font-size: 20px; margin: 0 0 15px 0; font-weight: 500;">Your Connection to Us</h3>
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0;">
          Your details in our care:<br>
          Phone: ${bookingData.customer_phone}<br>
          Email: ${bookingData.customer_email}
        </p>
        ${
          bookingData.notes
            ? `
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #D7DBCC;">
          <p style="color: #4A5D23; font-weight: 500; margin: 0 0 10px 0;">Your Message to Us:</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0;">${bookingData.notes}</p>
        </div>
        `
            : ""
        }
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #4A5D23; font-size: 16px; font-weight: 500; margin: 0 0 15px 0;">
          Need a Gentle Reminder or Help?
        </p>
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          We're here to nurture your journey:<br>
          Phone: +354 788 5500<br>
          Email: tours@mama.is
        </p>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #D7DBCC;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            MAMA Tours<br>
            Nurturing Experiences in Nature<br>
            Bankastræti 2, 101 Reykjavik<br>
            Iceland
          </p>
        </div>
      </div>
    </div>
      `,
    };

    try {
      await sgMail.send(customerMsg);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Continue with the process even if email fails
    }

    // For server callbacks, return XML response
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
