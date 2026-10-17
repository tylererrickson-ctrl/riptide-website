import type { MetadataRoute } from "next";
import { isIndexable, siteUrl } from "@/lib/site";

/** Production: crawlable (except Studio/API) with sitemap. Staging/preview/local: block everything. */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/studio", "/api/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
