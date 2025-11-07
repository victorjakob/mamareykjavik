import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { error, errorInfo, url, userAgent } = await req.json();

    // Only send error emails in production (avoid spam during development)
    if (process.env.NODE_ENV !== "production") {
      console.error("Error reported (dev mode, not sending email):", error);
      return NextResponse.json({ success: true, dev: true });
    }

    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="background-color: #dc2626; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; font-size: 24px; margin: 0;">🚨 Application Error</h1>
        </div>

        <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <div style="margin-bottom: 20px;">
            <h2 style="color: #374151; font-size: 18px; margin: 0 0 10px 0;">Error Message</h2>
            <div style="background-color: #fee2e2; padding: 15px; border-radius: 6px; border-left: 4px solid #dc2626;">
              <code style="color: #991b1b; font-size: 14px; word-break: break-word;">
                ${error?.message || "Unknown error"}
              </code>
            </div>
          </div>

          ${error?.stack ? `
            <div style="margin-bottom: 20px;">
              <h2 style="color: #374151; font-size: 18px; margin: 0 0 10px 0;">Stack Trace</h2>
              <div style="background-color: #1f2937; padding: 15px; border-radius: 6px; overflow-x: auto;">
                <pre style="color: #f3f4f6; font-size: 12px; margin: 0; white-space: pre-wrap; word-wrap: break-word;">${error.stack}</pre>
              </div>
            </div>
          ` : ''}

          ${errorInfo?.componentStack ? `
            <div style="margin-bottom: 20px;">
              <h2 style="color: #374151; font-size: 18px; margin: 0 0 10px 0;">Component Stack</h2>
              <div style="background-color: #1f2937; padding: 15px; border-radius: 6px; overflow-x: auto;">
                <pre style="color: #f3f4f6; font-size: 12px; margin: 0; white-space: pre-wrap; word-wrap: break-word;">${errorInfo.componentStack}</pre>
              </div>
            </div>
          ` : ''}

          <div style="margin-bottom: 20px;">
            <h2 style="color: #374151; font-size: 18px; margin: 0 0 10px 0;">Context</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px; font-weight: bold; color: #6b7280;">URL:</td>
                <td style="padding: 8px; color: #374151; word-break: break-all;">${url || "Unknown"}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px; font-weight: bold; color: #6b7280;">Time:</td>
                <td style="padding: 8px; color: #374151;">${new Date().toISOString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #6b7280;">User Agent:</td>
                <td style="padding: 8px; color: #374151; word-break: break-all; font-size: 12px;">${userAgent || "Unknown"}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
            <p style="color: #92400e; font-size: 14px; margin: 0;">
              <strong>Action Required:</strong> Check your application logs and investigate this error.
            </p>
          </div>
        </div>

        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">mama.is - Error Monitoring</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: "Mama Error Monitor <errors@mama.is>",
      to: process.env.ERROR_NOTIFICATION_EMAIL || "your-email@example.com",
      subject: `🚨 Error: ${error?.message?.substring(0, 50) || "Application Error"}`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (emailError) {
    console.error("Failed to send error notification email:", emailError);
    return NextResponse.json(
      { success: false, error: "Failed to send notification" },
      { status: 500 }
    );
  }
}

