import { cacheTag } from "next/cache";
import { cookies, draftMode } from "next/headers";
import {
  defineLive,
  resolvePerspectiveFromCookies,
  resolveVariantFromCookies,
  type LivePerspective,
  type StrictDefinedFetchType,
} from "next-sanity/live";
import { client } from "./client";

const token = process.env.SANITY_API_READ_TOKEN;

export const { sanityFetch, SanityLive } = defineLive({
  client,
  browserToken: token,
  serverToken: token,
  strict: true,
});

/** Site-wide cache tag on every Sanity read; /api/revalidate expires it on publish. */
export const SITE_CACHE_TAG = "sanity";

/**
 * The app's one shared 'use cache' boundary for Sanity reads.
 *
 * Published reads go straight to the Sanity API (client has useCdn:false), cached only in this
 * 'use cache' entry under SITE_CACHE_TAG, which /api/revalidate expires on every publish.
 * They deliberately bypass defineLive's sanityFetch: that forces the Sanity CDN and stores results in
 * the cross-deployment fetch cache until a sync-tag revalidation. A page regenerated in the seconds
 * after a publish (before the CDN caught up) re-cached the OLD content there, and later builds reused
 * it — published edits appeared to revert after deploys (2026-10-17). Draft/preview reads still use
 * sanityFetch so Presentation and live preview keep working.
 */
export const cachedSanity: StrictDefinedFetchType = async (options) => {
  "use cache";
  cacheTag(SITE_CACHE_TAG);
  if (options.perspective === "published" && !options.stega) {
    const data = await client.fetch(options.query, options.params ?? {}, {
      perspective: "published",
      useCdn: false,
      stega: false,
      cache: "no-store",
    });
    return { data, sourceMap: null, tags: [SITE_CACHE_TAG] } as Awaited<ReturnType<StrictDefinedFetchType>>;
  }
  return sanityFetch({ ...options, tags: [...(options.tags ?? []), SITE_CACHE_TAG] });
};

export interface DynamicFetchOptions {
  perspective: LivePerspective;
  variant?: string;
  stega: boolean;
}

/** Resolve draft-mode dependent options outside of 'use cache' boundaries. */
export async function getDynamicFetchOptions(): Promise<DynamicFetchOptions> {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return { perspective: "published", stega: false };
  const jar = await cookies();
  const perspective = await resolvePerspectiveFromCookies({ cookies: jar });
  const variant = await resolveVariantFromCookies({ cookies: jar });
  return { perspective: perspective ?? "drafts", variant, stega: true };
}
