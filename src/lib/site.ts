/**
 * Indexing policy. Only the production deployment with SITE_INDEXABLE=true is
 * indexable; staging, preview and local builds are always noindex.
 * scripts/check-indexing.mjs fails the production build if this would be false.
 */
export const isIndexable =
  process.env.VERCEL_ENV === "production" && process.env.SITE_INDEXABLE === "true";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
).replace(/\/$/, "");
