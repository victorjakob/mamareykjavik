"use client";

// Root-layout error boundary. This catches errors thrown inside the root
// layout itself (providers, DarkNavbar, etc.) — places where `error.js`
// cannot help because the layout has failed to render.
//
// Next.js requires global-error.js to render its own <html> and <body>,
// because the usual root layout hasn't mounted. We keep it minimal: no
// external fonts, no providers, no framer-motion — pure inline styles so
// that even if every bundle on the page is broken, the user sees a warm
// fallback with a way out.

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
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
          source: "app/global-error.js",
        }),
      }).catch(() => {});
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background:
            "linear-gradient(135deg, #1a0f08 0%, #2c1810 50%, #5c2e12 100%)",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          color: "#2c1810",
        }}
      >
        <div
          style={{
            maxWidth: "440px",
            width: "100%",
            background: "#ffffff",
            border: "1px solid #eadfd2",
            borderRadius: "20px",
            padding: "34px 28px",
            textAlign: "center",
            boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              margin: "0 auto 18px",
              borderRadius: "50%",
              background: "#fff6ea",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
            }}
            aria-hidden="true"
          >
            ·
          </div>
          <h1
            style={{
              margin: "0 0 10px",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: "28px",
              color: "#2c1810",
            }}
          >
            A deep breath, then try again
          </h1>
          <p
            style={{
              margin: "0 0 24px",
              fontSize: "15px",
              lineHeight: 1.7,
              color: "#4e3c30",
            }}
          >
            Something unexpected happened while loading Mama. Our team has been
            notified. Reload to try again, or come back in a moment.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => reset()}
              style={{
                background: "#c76a2b",
                color: "#ffffff",
                border: "none",
                padding: "13px 28px",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "15px",
                cursor: "pointer",
                minWidth: "180px",
              }}
            >
              Reload
            </button>
            <a
              href="/"
              style={{
                color: "#2c1810",
                fontSize: "14px",
                textDecoration: "underline",
                textDecorationColor: "#c76a2b",
                textUnderlineOffset: "3px",
              }}
            >
              Go to the home page
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
