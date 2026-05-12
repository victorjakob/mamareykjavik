// Preview adapter for the "Catering Quote — Customer Confirmation".
// ────────────────────────────────────────────────────────────────────
// Mirrors EXACTLY the customer-side HTML sent by:
//   src/app/api/sendgrid/catering-quote/route.js  (second resend.emails.send)
//
// Dark/cream Georgia design with #ff914d accents. The team-side variant is
// a separate adapter (see cateringQuoteTeam.js) so each entry in the email
// hub has its own faithful preview.

import "server-only";

export const previewProps = {
  name: "Sólveig Magnúsdóttir",
  email: "solveig@example.is",
  phone: "+354 555 1234",
  address: "Skólavörðustígur 18, 101 Reykjavík",
  date: "Friday 19 June 2026",
  notes:
    "Several guests are gluten-free. We'd love a couple of mocktails on arrival if possible.",
  items: [
    { dish: "Cacao bowl", qty: 30 },
    { dish: "Ginger lentil soup", qty: 30 },
    { dish: "Mama bowl (build-your-own)", qty: 30 },
  ],
};

export function renderHtml({
  name = previewProps.name,
  address = previewProps.address,
  date = previewProps.date,
  items = previewProps.items,
} = {}) {
  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #2a1f17;color:#f0ebe3;">${item.dish}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #2a1f17;color:#f0ebe3;text-align:right;">${item.qty} portions</td>
          </tr>`,
    )
    .join("");
  const totalPortions = items.reduce((sum, i) => sum + i.qty, 0);

  return `
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
      `;
}
