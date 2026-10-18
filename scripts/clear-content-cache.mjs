/**
 * Runs before every build (npm "prebuild"). Vercel restores `.next/cache` from the previous deployment,
 * and `.next/cache/fetch-cache` holds cached Sanity query results. Reusing it means a deploy can
 * prerender pages with content from before the latest publish — and they stay stale until the next
 * publish (seen twice on 2026-10-17). Compiled-code caches (turbopack) are kept, so builds stay fast.
 */
import { rmSync } from "node:fs";

rmSync(".next/cache/fetch-cache", { recursive: true, force: true });
console.log("Cleared cached CMS content (.next/cache/fetch-cache) so this build prerenders fresh content.");
