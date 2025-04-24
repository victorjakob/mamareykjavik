/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,

    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.graphassets.com",
      },
    ],
    domains: [
      "cmqoetecaasivfzxgnxe.supabase.co",
      "firebasestorage.googleapis.com",
      "res.cloudinary.com",
    ],
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
