import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Allow ANY bucket in us-east-1 (bucket.s3.us-east-1.amazonaws.com)
      {
        protocol: "https",
        hostname: "*.s3.us-east-1.amazonaws.com",
        pathname: "/**",
      },
      // Some AWS URLs come back as bucket.s3.amazonaws.com
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
