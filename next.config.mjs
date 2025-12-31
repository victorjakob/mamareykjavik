/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure clean builds - Vercel handles this automatically, but this is a safety measure
  cleanDistDir: true,

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

  // Allow Cloudflare tunnel for testing
  experimental: {
    serverActions: {
      allowedOrigins: [
        "alter-gotten-wichita-rugby.trycloudflare.com",
        "test.borgun.is", // SaltPay payment gateway
        "mama.is",
        "localhost:3000",
      ],
    },
  },

  async headers() {
    return [
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
