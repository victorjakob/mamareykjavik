// Preview adapter for the "WL Venue Rental Inquiry — Customer Confirmation".
// ──────────────────────────────────────────────────────────────────────────
// Mirrors EXACTLY the customer-side HTML sent by:
//   src/app/api/sendgrid/email-wl-rent/route.js  (second resend.emails.send)

import "server-only";

export const previewProps = {
  name: "Jón Pálsson",
  email: "jon@example.is",
  event: "60th birthday dinner",
  timeAndDate: "Saturday 13 June 2026 · 19:00 – 23:00",
  guestCount: 48,
  comments:
    "We'd like a long communal table if possible. Vegan menu, half guests are flying in from abroad.",
};

export function renderHtml({
  name = previewProps.name,
  email = previewProps.email,
  event = previewProps.event,
  timeAndDate = previewProps.timeAndDate,
  guestCount = previewProps.guestCount,
  comments = previewProps.comments,
} = {}) {
  return `
        <h2>Thank you for your inquiry, ${name}!</h2>
        <p>We have received your rental inquiry for White Lotus venue with the following details:</p>
        <p><strong>Event Type:</strong> ${event}</p>
        <p><strong>Requested Date/Time:</strong> ${
          timeAndDate || "Not specified"
        }</p>
        <p><strong>Expected Guest Count:</strong> ${
          guestCount || "Not specified"
        }</p>
        <p><strong>Additional Details:</strong> ${
          comments || "None provided"
        }</p>
        <br>
        <p>We will review your request and get back to you shortly at this email address (${email}).</p>
        <br>
        <p>Best regards,</p>
        <p>The White Lotus Team</p>
      `;
}
