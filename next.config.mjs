/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure clean builds - Vercel handles this automatically, but this is a safety measure
  cleanDistDir: true,

  // Strip console.* calls from production bundles to keep the client bundle
  // lean and avoid leaking internals via DevTools. We keep console.error so
  // real errors still surface in Vercel logs (and any Sentry-style pipe).
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  images: {
    dangerouslyAllowSVG: true,
    qualities: [70, 75, 80, 85, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.graphassets.com",
      },
      {
        protocol: "https",
        hostname: "cmqoetecaasivfzxgnxe.supabase.co",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  experimental: {
    serverActions: {
      allowedOrigins: [
        "test.borgun.is", // SaltPay payment gateway
        "mama.is",
        "localhost:3000",
      ],
    },
  },

  async headers() {
    // Site-wide security headers. Applied via `source: "/:path*"` so they
    // cover every page and API route. The CORS block for /tours/success
    // stays in place afterwards (more specific source wins).
    const securityHeaders = [
      {
        // HSTS — force HTTPS for 2 years, include subdomains, and eligible
        // for the HSTS preload list (hstspreload.org).
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      {
        // Prevent MIME-type sniffing. Browsers must respect our Content-Type.
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        // Only allow embedding from our own origin — protects against
        // clickjacking on payment / auth pages.
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
      {
        // Send the origin to cross-origin links but never the full path,
        // and drop the referrer entirely on HTTPS → HTTP downgrades.
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        // Deny powerful browser APIs by default. Geolocation is allowed
        // on the same origin (for future "find us" features). Extend as
        // needed — payment=() would break Apple Pay, for example.
        key: "Permissions-Policy",
        value:
          "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
      },
      {
        // Cross-origin isolation — safe default that does not break
        // Supabase, Resend, Google OAuth, or Cloudinary.
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin-allow-popups",
      },
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/tours/success",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },

  //TODO: Look into configuring redirects for domains
  // async redirects() {
  //   return [
  //     {
  //       source: "https://whitelotus.is",
  //       destination: "/events",
  //       permanent: false,
  //     },
  //   ];
  // },
};

export default nextConfig;
