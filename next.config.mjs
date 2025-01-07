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
    domains: ["picsum.photos"], // Add your external domain here
  },
};

export default nextConfig;
