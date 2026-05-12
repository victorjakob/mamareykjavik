// Preview adapter for the "Contact Form Submission (Team)" email.
// ──────────────────────────────────────────────────────────────────
// Mirrors EXACTLY the HTML sent by:
//   src/app/api/sendgrid/contact-form/route.js
// If you change this file, also update the route (or vice-versa). Eventually
// the route will be refactored to import this function directly.

import "server-only";

export const previewProps = {
  name: "Anna Sigurðardóttir",
  email: "anna@example.is",
  message:
    "Halló! I'd love to know whether the back room is available for a small private gathering on a Saturday in June. Around 18 guests. Takk fyrir!",
  source: "Contact page",
};

export function renderHtml({
  name = previewProps.name,
  email = previewProps.email,
  message = previewProps.message,
  source = previewProps.source,
} = {}) {
  const messageSource = (source || "").trim() || "website";
  return `
        <h2>New Message from ${messageSource}</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Source:</strong> ${messageSource}</p>
        <p><strong>Message:</strong> ${message || "No message provided"}</p>
        <br><br>
        <p>Best regards,</p>
        <p>Mama Reykjavík</p>
        <p>team@mama.is</p>
        <p><a href="https://mama.is">https://mama.is</a></p>
      `;
}
