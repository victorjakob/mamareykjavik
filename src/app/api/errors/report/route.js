import { Resend } from "resend";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple in-memory rate limiting (resets on server restart)
// Note: On Vercel/serverless, this is per-instance only, not global
// It's fine as a spam reducer, but the secret is the real protection
const errorRateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_EMAILS_PER_ERROR = 3; // Max 3 emails per error per hour

// Escape HTML to prevent injection
function escapeHtml(input = "") {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Safely extract pathname from URL without throwing
function safePathFromUrl(url) {
  if (!url) return "";
  try {
    return new URL(url).pathname || "";
  } catch {
    return "";
  }
}

function getErrorKey(error, url) {
  // Create a unique key based on error message and URL
  const message = error?.message || "";
  const urlPath = safePathFromUrl(url);
  return `${message.substring(0, 100)}|${urlPath}`;
}

export async function POST(req) {
  try {
    // Security: Require shared secret to prevent abuse (if configured)
    // Note: If ERROR_REPORTING_SECRET is not set, we allow client-side errors through
    // but they're still filtered and rate-limited
    const secret = req.headers.get("x-error-secret");
    if (process.env.ERROR_REPORTING_SECRET) {
      if (secret !== process.env.ERROR_REPORTING_SECRET) {
        return NextResponse.json({ success: false }, { status: 401 });
      }
    }

    const { error, errorInfo, url, userAgent } = await req.json();

    // Only send error emails in production (avoid spam during development)
    if (process.env.NODE_ENV !== "production") {
      console.error("Error reported (dev mode, not sending email):", error);
      return NextResponse.json({ success: true, dev: true });
    }

    // Filter out errors we don't care about
    const errorMessage = error?.message || "";
    const errorStack = error?.stack || "";
    const combinedError = `${errorMessage} ${errorStack}`.toLowerCase();

    // Ignore chunk loading errors (ChunkReloadHandler handles these)
    const isChunkError =
      combinedError.includes("chunkloaderror") ||
      combinedError.includes("failed to load chunk") ||
      combinedError.includes("failed to fetch dynamically imported module") ||
      combinedError.includes("loading chunk") ||
      combinedError.includes("/_next/static/chunks/");

    // Ignore bot/crawler errors (not real user errors)
    // Case-insensitive check
    const ua = (userAgent || "").toLowerCase();
    const isBot =
      ua.includes("bot") ||
      ua.includes("crawler") ||
      ua.includes("spider") ||
      ua.includes("googlebot") ||
      ua.includes("bingbot") ||
      ua.includes("facebookexternalhit") ||
      ua.includes("twitterbot") ||
      ua.includes("linkedinbot");

    // Ignore common browser extension errors
    const isBrowserExtensionError =
      combinedError.includes("extension") ||
      combinedError.includes("chrome-extension://") ||
      combinedError.includes("moz-extension://");

    // Ignore network errors that are likely user-side issues
    const isNetworkError =
      combinedError.includes("networkerror") ||
      combinedError.includes("failed to fetch") ||
      combinedError.includes("network request failed") ||
      combinedError.includes("load failed");

    // Skip sending email for filtered errors
    if (isChunkError || isBot || isBrowserExtensionError || isNetworkError) {
      console.log("Error filtered out:", {
        isChunkError,
        isBot,
        isBrowserExtensionError,
        isNetworkError,
        message: errorMessage.substring(0, 100),
      });
      return NextResponse.json({ success: true, filtered: true });
    }

    // Rate limiting: prevent duplicate emails for the same error
    const errorKey = getErrorKey(error, url);
    const now = Date.now();
    const errorRecord = errorRateLimit.get(errorKey);

    if (errorRecord) {
      // Check if we're still within the rate limit window
      if (now - errorRecord.firstSeen < RATE_LIMIT_WINDOW) {
        errorRecord.count += 1;

        // If we've exceeded the limit, skip sending email
        if (errorRecord.count > MAX_EMAILS_PER_ERROR) {
          console.log(
            `Error rate limited (${errorRecord.count} occurrences):`,
            errorMessage.substring(0, 100)
          );
          return NextResponse.json({ success: true, rateLimited: true });
        }

        // Update last seen time
        errorRecord.lastSeen = now;
      } else {
        // Reset if outside the window
        errorRateLimit.set(errorKey, {
          count: 1,
          firstSeen: now,
          lastSeen: now,
        });
      }
    } else {
      // First time seeing this error
      errorRateLimit.set(errorKey, {
        count: 1,
        firstSeen: now,
        lastSeen: now,
      });
    }

    // Clean up old entries (older than 24 hours) to prevent memory leaks
    if (errorRateLimit.size > 1000) {
      for (const [key, record] of errorRateLimit.entries()) {
        if (now - record.lastSeen > 24 * 60 * 60 * 1000) {
          errorRateLimit.delete(key);
        }
      }
    }

    // Get occurrence count for this error
    const errorRecordFinal = errorRateLimit.get(errorKey);
    const occurrenceCount = errorRecordFinal?.count || 1;
    const rateLimitNote =
      occurrenceCount > 1
        ? `<div style="background-color: #fef3c7; padding: 12px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #f59e0b;">
            <p style="color: #92400e; font-size: 13px; margin: 0;">
              <strong>⚠️ Note:</strong> This error has occurred ${occurrenceCount} time(s) in the last hour.
            </p>
          </div>`
        : "";

    // Escape all user input to prevent HTML injection
    const safeMessage = escapeHtml(error?.message || "Unknown error");
    const safeStack = escapeHtml(error?.stack || "");
    const safeComponentStack = escapeHtml(errorInfo?.componentStack || "");
    const safeUrl = escapeHtml(url || "Unknown");
    const safeUa = escapeHtml(userAgent || "Unknown");

    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="background-color: #dc2626; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; font-size: 24px; margin: 0;">🚨 Application Error</h1>
        </div>

        <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          ${rateLimitNote}
          <div style="margin-bottom: 20px;">
            <h2 style="color: #374151; font-size: 18px; margin: 0 0 10px 0;">Error Message</h2>
            <div style="background-color: #fee2e2; padding: 15px; border-radius: 6px; border-left: 4px solid #dc2626;">
              <code style="color: #991b1b; font-size: 14px; word-break: break-word;">
                ${safeMessage}
              </code>
            </div>
          </div>

          ${
            safeStack
              ? `
            <div style="margin-bottom: 20px;">
              <h2 style="color: #374151; font-size: 18px; margin: 0 0 10px 0;">Stack Trace</h2>
              <div style="background-color: #1f2937; padding: 15px; border-radius: 6px; overflow-x: auto;">
                <pre style="color: #f3f4f6; font-size: 12px; margin: 0; white-space: pre-wrap; word-wrap: break-word;">${safeStack}</pre>
              </div>
            </div>
          `
              : ""
          }

          ${
            safeComponentStack
              ? `
            <div style="margin-bottom: 20px;">
              <h2 style="color: #374151; font-size: 18px; margin: 0 0 10px 0;">Component Stack</h2>
              <div style="background-color: #1f2937; padding: 15px; border-radius: 6px; overflow-x: auto;">
                <pre style="color: #f3f4f6; font-size: 12px; margin: 0; white-space: pre-wrap; word-wrap: break-word;">${safeComponentStack}</pre>
              </div>
            </div>
          `
              : ""
          }

          <div style="margin-bottom: 20px;">
            <h2 style="color: #374151; font-size: 18px; margin: 0 0 10px 0;">Context</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px; font-weight: bold; color: #6b7280;">URL:</td>
                <td style="padding: 8px; color: #374151; word-break: break-all;">${safeUrl}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px; font-weight: bold; color: #6b7280;">Time:</td>
                <td style="padding: 8px; color: #374151;">${new Date().toISOString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #6b7280;">User Agent:</td>
                <td style="padding: 8px; color: #374151; word-break: break-all; font-size: 12px;">${safeUa}</td>
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

    // Escape subject line (email subjects don't render HTML, but we should still sanitize)
    const safeSubject = escapeHtml(
      error?.message?.substring(0, 50) || "Application Error"
    );

    await resend.emails.send({
      from: "Mama Error Monitor <errors@mama.is>",
      to: process.env.ERROR_NOTIFICATION_EMAIL || "your-email@example.com",
      subject: `🚨 Error${occurrenceCount > 1 ? ` (${occurrenceCount}x)` : ""}: ${safeSubject}`,
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
