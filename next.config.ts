import type { NextConfig } from "next";
import { sanity } from "next-sanity/live/cache-life";
import { loadRedirects } from "./src/config/redirects.mjs";

const indexable = process.env.VERCEL_ENV === "production" && process.env.SITE_INDEXABLE === "true";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_YEAR: String(new Date().getFullYear()),
    // Links to redirected paths skip prefetch (prefetching a cross-origin redirect fails CORS).
    NEXT_PUBLIC_REDIRECT_SOURCES: JSON.stringify(loadRedirects().map((r) => r.source)),
  },
  cacheComponents: true,
  // Opt out of cross-deployment "immutable" static assets: on Vercel a changed stylesheet kept its old
  // filename and the previous deployment's cached copy kept being served (2026-10-17, team-card styles).
  // Each deployment now serves its own assets (with ?dpl), at the cost of re-downloading after deploys.
  supportsImmutableAssets: false,
  // One branded 404 for unmatched URLs across both root layouts (site + Studio).
  experimental: { globalNotFound: true },
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
  // Trailing slashes are stripped with a 301 in src/proxy.ts (Next's built-in redirect is a 308).
  skipTrailingSlashRedirect: true,
  async redirects() {
    return loadRedirects();
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
