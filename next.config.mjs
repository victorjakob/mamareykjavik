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
