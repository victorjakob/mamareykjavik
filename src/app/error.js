"use client";

// Route-level error boundary for the App Router.
// Catches runtime errors in any segment inside /src/app/ (except the root
// layout — that's handled by global-error.js). When this trips, the rest
// of the layout (nav, footer, providers) still renders; only the failing
// route segment is replaced by this fallback.
//
// This complements the top-level React ErrorBoundary in layout.js, which
// catches render errors. This file catches server/client component errors
// that bubble up to the route segment.

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function RouteError({ error, reset }) {
  useEffect(() => {
    // Report the error — mirrors the ErrorBoundary behaviour.
    if (typeof window !== "undefined") {
      fetch("/api/errors/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: {
            message: error?.message,
            stack: error?.stack,
            digest: error?.digest,
          },
          url: window.location.href,
          userAgent: navigator.userAgent,
          source: "app/error.js",
        }),
      }).catch(() => {
        // Swallow — the error reporter itself may be down, nothing we can do.
      });
    }
  }, [error]);

  return (
    <div
      data-navbar-theme="dark"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a0f08] via-[#2c1810] to-[#5c2e12] px-5 py-24"
    >
      <div className="max-w-md w-full bg-white/95 border border-[#eadfd2] rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-5 bg-[#fff6ea] rounded-full flex items-center justify-center">
          <AlertCircle className="h-9 w-9 text-[#c76a2b]" />
        </div>

        <h1 className="font-cormorant italic text-[#2c1810] text-3xl mb-2">
          Something went sideways
        </h1>
        <p className="text-[#4e3c30] text-[15px] leading-relaxed mb-6">
          A small hiccup on our end — we&apos;ve been notified. Try again, or
          head home while we sort it out.
        </p>

        {process.env.NODE_ENV === "development" && error?.message && (
          <div className="mb-6 p-4 bg-[#fff6ea] rounded-lg text-left border border-[#eadfd2]">
            <p className="text-xs font-mono text-[#8a3a14] break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-[10px] font-mono text-[#8a7261] mt-2">
                digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#c76a2b] hover:bg-[#a8551e] text-white rounded-full font-semibold transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-[#c76a2b] text-[#2c1810] hover:bg-[#fff6ea] rounded-full font-semibold transition-colors"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
