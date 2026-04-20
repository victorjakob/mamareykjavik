import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, address, date, notes, items } = body;

    // Format the order summary for emails
    const itemsHtml = items
      .map(
        (item) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #2a1f17;color:#f0ebe3;">${item.dish}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #2a1f17;color:#f0ebe3;text-align:right;">${item.qty} portions</td>
          </tr>`
      )
      .join("");

    const totalPortions = items.reduce((sum, i) => sum + i.qty, 0);

    const itemsText = items.map((i) => `• ${i.dish} — ${i.qty} portions`).join("\n");

    // ── Email to team ────────────────────────────────────────────
    await resend.emails.send({
      from: "Mama Catering <team@mama.is>",
      to: "team@mama.is",
      replyTo: email,
      subject: `🥡 New Catering Quote Request from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#0e0b08;font-family:'Georgia',serif;">
          <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

            <!-- Header -->
            <div style="text-align:center;margin-bottom:32px;">
              <p style="margin:0;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#ff914d;">Mama Reykjavík</p>
              <h1 style="margin:8px 0 0;font-size:28px;font-weight:300;font-style:italic;color:#f0ebe3;">New Catering Request</h1>
              <div style="width:40px;height:1px;background:#ff914d;margin:12px auto 0;opacity:0.5;"></div>
            </div>

            <!-- Customer info -->
            <div style="background:#1a1410;border:1px solid #2a1f17;border-radius:16px;padding:24px;margin-bottom:20px;">
              <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#ff914d;">Customer</p>
              <table style="width:100%;border-collapse:collapse;margin-top:12px;">
                <tr><td style="padding:6px 0;color:#a09488;font-size:13px;width:120px;">Name</td><td style="padding:6px 0;color:#f0ebe3;font-size:14px;font-weight:600;">${name}</td></tr>
                <tr><td style="padding:6px 0;color:#a09488;font-size:13px;">Email</td><td style="padding:6px 0;color:#f0ebe3;font-size:14px;"><a href="mailto:${email}" style="color:#ff914d;text-decoration:none;">${email}</a></td></tr>
                <tr><td style="padding:6px 0;color:#a09488;font-size:13px;">Phone</td><td style="padding:6px 0;color:#f0ebe3;font-size:14px;">${phone}</td></tr>
                <tr><td style="padding:6px 0;color:#a09488;font-size:13px;">Address</td><td style="padding:6px 0;color:#f0ebe3;font-size:14px;">${address}</td></tr>
                <tr><td style="padding:6px 0;color:#a09488;font-size:13px;">Date needed</td><td style="padding:6px 0;color:#f0ebe3;font-size:14px;">${date || "Not specified"}</td></tr>
              </table>
            </div>

            <!-- Order -->
            <div style="background:#1a1410;border:1px solid #2a1f17;border-radius:16px;padding:24px;margin-bottom:20px;">
              <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#ff914d;">Order</p>
              <table style="width:100%;border-collapse:collapse;margin-top:12px;">
                ${itemsHtml}
                <tr>
                  <td style="padding:10px 12px 0;color:#a09488;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;">Total</td>
                  <td style="padding:10px 12px 0;color:#ff914d;font-size:15px;font-weight:700;text-align:right;">${totalPortions} portions</td>
                </tr>
              </table>
            </div>

            <!-- Notes -->
            ${
              notes
                ? `<div style="background:#1a1410;border:1px solid #2a1f17;border-radius:16px;padding:24px;margin-bottom:20px;">
                <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#ff914d;">Notes</p>
                <p style="margin:0;color:#a09488;font-size:14px;line-height:1.6;">${notes}</p>
              </div>`
                : ""
            }

            <!-- Footer -->
            <p style="text-align:center;margin-top:32px;font-size:11px;color:#4a3f37;">
              Reply directly to this email to reach ${name} at <a href="mailto:${email}" style="color:#ff914d;">${email}</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    // ── Confirmation email to customer ───────────────────────────
    await resend.emails.send({
      from: "Mama Reykjavík <team@mama.is>",
      to: [email],
      replyTo: "team@mama.is",
      subject: "Your catering quote request — Mama Reykjavík",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#0e0b08;font-family:'Georgia',serif;">
          <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

            <!-- Header -->
            <div style="text-align:center;margin-bottom:32px;">
              <p style="margin:0;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#ff914d;">Mama Reykjavík</p>
              <h1 style="margin:8px 0 0;font-size:30px;font-weight:300;font-style:italic;color:#f0ebe3;">We got your request,<br>${name.split(" ")[0]}.</h1>
              <div style="width:40px;height:1px;background:#ff914d;margin:12px auto 0;opacity:0.5;"></div>
            </div>

            <!-- Message -->
            <div style="background:#1a1410;border:1px solid #2a1f17;border-radius:16px;padding:28px;margin-bottom:20px;">
              <p style="margin:0 0 16px;color:#a09488;font-size:15px;line-height:1.75;">
                Thank you for reaching out. We're reviewing your catering request and will come back to you with a personalised quote within <strong style="color:#f0ebe3;">24–48 hours</strong>.
              </p>
              <p style="margin:0;color:#a09488;font-size:15px;line-height:1.75;">
                Here's a summary of what you requested:
              </p>
            </div>

            <!-- Order summary -->
            <div style="background:#1a1410;border:1px solid #2a1f17;border-radius:16px;padding:24px;margin-bottom:20px;">
              <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#ff914d;">Your order</p>
              <table style="width:100%;border-collapse:collapse;margin-top:12px;">
                ${itemsHtml}
                <tr>
                  <td style="padding:10px 12px 0;color:#a09488;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;">Total</td>
                  <td style="padding:10px 12px 0;color:#ff914d;font-size:15px;font-weight:700;text-align:right;">${totalPortions} portions</td>
                </tr>
              </table>
              <div style="border-top:1px solid #2a1f17;margin-top:16px;padding-top:16px;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:4px 0;color:#a09488;font-size:13px;width:120px;">Delivery to</td><td style="padding:4px 0;color:#f0ebe3;font-size:13px;">${address}</td></tr>
                  <tr><td style="padding:4px 0;color:#a09488;font-size:13px;">Date needed</td><td style="padding:4px 0;color:#f0ebe3;font-size:13px;">${date || "Not specified"}</td></tr>
                </table>
              </div>
            </div>

            <!-- Contact -->
            <div style="text-align:center;padding:24px;">
              <p style="margin:0 0 4px;font-size:13px;color:#a09488;">Any questions? Reach us at</p>
              <a href="mailto:team@mama.is" style="color:#ff914d;font-size:14px;text-decoration:none;font-weight:600;">team@mama.is</a>
              <p style="margin:12px 0 0;font-size:12px;color:#4a3f37;">Bankastræti 2, 101 Reykjavík</p>
            </div>

            <!-- Footer -->
            <div style="border-top:1px solid #1a1410;padding-top:20px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#3a3028;letter-spacing:0.15em;">100% PLANT-BASED · MAMA REYKJAVÍK</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ message: "Quote request sent" }, { status: 200 });
  } catch (error) {
    console.error("Catering quote error:", error);
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }
}
