/**
 * Report client-side errors to the server
 */
export async function reportError(error, context = {}) {
  try {
    // Only report in production to avoid spam during development
    if (process.env.NODE_ENV !== "production") {
      console.error("Error (dev mode):", error, context);
      return;
    }

    await fetch("/api/errors/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: {
          message: error?.message || String(error),
          stack: error?.stack,
        },
        url: typeof window !== "undefined" ? window.location.href : undefined,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        context,
      }),
    });
  } catch (reportError) {
    // Silently fail - don't want error reporting to break the app
    console.error("Failed to report error:", reportError);
  }
}

/**
 * Wrap async functions to automatically report errors
 */
export function withErrorReporting(fn, context = {}) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      await reportError(error, { ...context, args });
      throw error;
    }
  };
}

