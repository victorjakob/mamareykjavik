import { Resend } from "resend";
import { NextResponse } from "next/server";
import { renderEmail } from "@/emails/render.server";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple in-memory rate limiting (resets on server restart)
// Note: On Vercel/serverless, this is per-instance only, not global.
// It's fine as a spam reducer, but the secret is the real protection.
const errorRateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_EMAILS_PER_ERROR = 3; // Max 3 emails per error per hour

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
  const message = error?.message || "";
  const urlPath = safePathFromUrl(url);
  return `${message.substring(0, 100)}|${urlPath}`;
}

export async function POST(req) {
  try {
    // Security: shared-secret check (if configured)
    const secret = req.headers.get("x-error-secret");
    if (process.env.ERROR_REPORTING_SECRET) {
      if (secret !== process.env.ERROR_REPORTING_SECRET) {
        return NextResponse.json({ success: false }, { status: 401 });
      }
    }

    const { error, errorInfo, url, userAgent } = await req.json();

    // Only send error emails in production
    if (process.env.NODE_ENV !== "production") {
      console.error("Error reported (dev mode, not sending email):", error);
      return NextResponse.json({ success: true, dev: true });
    }

    const errorMessage = error?.message || "";
    const errorStack = error?.stack || "";
    const combinedError = `${errorMessage} ${errorStack}`.toLowerCase();

    // Filter chunk-loading, bot, extension, network noise
    const isChunkError =
      combinedError.includes("chunkloaderror") ||
      combinedError.includes("failed to load chunk") ||
      combinedError.includes("failed to fetch dynamically imported module") ||
      combinedError.includes("loading chunk") ||
      combinedError.includes("/_next/static/chunks/");
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
    const isBrowserExtensionError =
      combinedError.includes("extension") ||
      combinedError.includes("chrome-extension://") ||
      combinedError.includes("moz-extension://");
    const isNetworkError =
      combinedError.includes("networkerror") ||
      combinedError.includes("failed to fetch") ||
      combinedError.includes("network request failed") ||
      combinedError.includes("load failed");

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

    // Rate limit: max 3 per error/url per hour
    const errorKey = getErrorKey(error, url);
    const now = Date.now();
    const errorRecord = errorRateLimit.get(errorKey);

    if (errorRecord) {
      if (now - errorRecord.firstSeen < RATE_LIMIT_WINDOW) {
        errorRecord.count += 1;
        if (errorRecord.count > MAX_EMAILS_PER_ERROR) {
          console.log(
            `Error rate limited (${errorRecord.count} occurrences):`,
            errorMessage.substring(0, 100)
          );
          return NextResponse.json({ success: true, rateLimited: true });
        }
        errorRecord.lastSeen = now;
      } else {
        errorRateLimit.set(errorKey, { count: 1, firstSeen: now, lastSeen: now });
      }
    } else {
      errorRateLimit.set(errorKey, { count: 1, firstSeen: now, lastSeen: now });
    }

    // Clean up old entries to prevent memory leaks
    if (errorRateLimit.size > 1000) {
      for (const [key, record] of errorRateLimit.entries()) {
        if (now - record.lastSeen > 24 * 60 * 60 * 1000) {
          errorRateLimit.delete(key);
        }
      }
    }

    const errorRecordFinal = errorRateLimit.get(errorKey);
    const occurrenceCount = errorRecordFinal?.count || 1;

    // Render via the React Email template
    const { html, text } = await renderEmail("error-notification-system", {
      message: error?.message || "Unknown error",
      stack: error?.stack || null,
      componentStack: errorInfo?.componentStack || null,
      url: url || "Unknown",
      userAgent: userAgent || "Unknown",
      occurrenceCount,
      timestamp: new Date().toISOString(),
    });

    const subjectMessage = (error?.message || "Application Error").substring(0, 80);

    await resend.emails.send({
      from: "Mama Error Monitor <errors@mama.is>",
      to: process.env.ERROR_NOTIFICATION_EMAIL || "your-email@example.com",
      subject: `🚨 Error${occurrenceCount > 1 ? ` (${occurrenceCount}x)` : ""}: ${subjectMessage}`,
      html,
      text,
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
