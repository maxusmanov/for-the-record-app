import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // album artwork from Apple's image servers (is1-ssl, is2-ssl, ...)
    remotePatterns: [
      { protocol: "https", hostname: "*.mzstatic.com", pathname: "/image/**" },
      // album artwork from Spotify search results
      { protocol: "https", hostname: "i.scdn.co", pathname: "/image/**" },
    ],
  },
};

export default nextConfig;
