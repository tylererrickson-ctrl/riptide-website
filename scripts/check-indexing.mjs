#!/usr/bin/env node
/**
 * Build guard (runs before `next build`).
 * Production deployments must be indexable; everything else must not be.
 * Fails the build if production would be served noindex.
 */
const env = process.env.VERCEL_ENV ?? "local";
const flag = process.env.SITE_INDEXABLE;

if (env === "production") {
  if (flag !== "true") {
    console.error(
      `\n✖ check-indexing: VERCEL_ENV=production but SITE_INDEXABLE=${flag ?? "(unset)"}.\n` +
        "  Production would be served noindex. Set SITE_INDEXABLE=true for the Production environment in Vercel.\n" +
        "  (Until launch, deploy staging as a Preview deployment instead of Production.)\n",
    );
    process.exit(1);
  }
  console.log("✔ check-indexing: production is indexable");
} else {
  if (flag === "true") {
    console.warn(`⚠ check-indexing: SITE_INDEXABLE=true is ignored outside production (VERCEL_ENV=${env}); serving noindex.`);
  }
  console.log(`✔ check-indexing: ${env} build will be noindex`);
}
