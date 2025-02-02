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
    ],
  },
};

export default nextConfig;
