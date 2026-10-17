import type { MetadataRoute } from "next";
import { cachedSanity } from "@/sanity/live";
import { SITEMAP_QUERY } from "@/sanity/queries";
import { siteUrl } from "@/lib/site";

/** Every published, indexable CMS page. Redirected (retired) URLs are intentionally absent. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await cachedSanity({ query: SITEMAP_QUERY, perspective: "published", stega: false });
  const pages = (data ?? []) as { path: string; _updatedAt: string }[];
  return pages.map((p) => ({
    url: `${siteUrl}${p.path === "/" ? "" : p.path}`,
    lastModified: p._updatedAt,
    changeFrequency: "monthly",
    priority: p.path === "/" ? 1 : 0.7,
  }));
}
