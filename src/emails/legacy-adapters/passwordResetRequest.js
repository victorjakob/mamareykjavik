// Preview adapter for the "Password Reset" email.
// ──────────────────────────────────────────────────
// Mirrors EXACTLY the HTML sent by:
//   src/app/api/auth/forgot-password/route.js

import "server-only";

export const previewProps = {
  resetLink: "https://mama.is/auth/reset-password?token=preview-token-abc123",
};

export function renderHtml({ resetLink = previewProps.resetLink } = {}) {
  return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #ff914d; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset Request</h1>
          </div>

          <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="color: #333333; font-size: 16px; line-height: 1.6;">
              <p>You requested to reset your password. Click the button below to reset it:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #ff914d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
              </div>
              <p style="color: #666666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee; color: #666666; font-size: 14px;">
              <p style="margin: 0;">Best regards,</p>
              <p style="margin: 5px 0;">Mama & The White Lotus Team</p>
            </div>
          </div>
        </div>
      `;
}
