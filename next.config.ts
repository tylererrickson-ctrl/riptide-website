import type { NextConfig } from "next";
import { sanity } from "next-sanity/live/cache-life";

const indexable = process.env.VERCEL_ENV === "production" && process.env.SITE_INDEXABLE === "true";

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_BUILD_YEAR: String(new Date().getFullYear()) },
  cacheComponents: true,
  partialPrefetching: true,
  cacheLife: { default: sanity },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async headers() {
    const headers = [
      {
        source: "/studio/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
    // Belt and braces with the robots meta tag: staging/preview/local are never indexable.
    if (!indexable) {
      headers.push({ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] });
    }
    return headers;
  },
};

export default nextConfig;
