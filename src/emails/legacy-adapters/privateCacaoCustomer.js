// Preview adapter for the "Private Cacao Inquiry — Customer Confirmation".
// ──────────────────────────────────────────────────────────────────────────
// Mirrors EXACTLY the customer-side HTML sent by:
//   src/app/api/sendgrid/private-cacao-booking/route.js (second resend.emails.send)

import "server-only";

export const previewProps = {
  name: "Hera Björk Þórhallsdóttir",
  participants: 12,
  intention: "Birthday celebration & gentle reset",
  location: "At Mama (the back room)",
  preferredDate: "Late June or early July",
  additionalNotes:
    "We'd love a 75-minute ceremony with cacao and breath. A few guests are pregnant.",
};

export function renderHtml({
  name = previewProps.name,
  participants = previewProps.participants,
  intention = previewProps.intention,
  location = previewProps.location,
  preferredDate = previewProps.preferredDate,
  additionalNotes = previewProps.additionalNotes,
} = {}) {
  const optionalListItem = (label, value) =>
    value ? `<li><strong>${label}:</strong> ${value}</li>` : "";

  return `
        <h2>Thank you, ${name}.</h2>
        <p>Your private cacao ceremony request is in. We read every inquiry personally and will reply within a few days.</p>
        <p>Here is a summary of what you shared:</p>
        <ul>
          <li><strong>Group size:</strong> ${participants}</li>
          ${optionalListItem("Intention or occasion", intention)}
          <li><strong>Location:</strong> ${location}</li>
          ${optionalListItem("Approximate window", preferredDate)}
          ${optionalListItem("Notes", additionalNotes)}
        </ul>
        <p>If anything changes, simply reply to this email and we'll update your request.</p>
        <br>
        <p>With gratitude,</p>
        <p>The Mama Team</p>
        <p>team@mama.is</p>
        <p><a href="https://mama.is">https://mama.is</a></p>
      `;
}
