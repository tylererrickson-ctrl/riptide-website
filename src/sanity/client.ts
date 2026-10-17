import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, studioUrl } from "./env";

/**
 * Server-side client. The dataset is private (it holds the publish and acceptance logs),
 * so reads use the viewer token. The token is not NEXT_PUBLIC_ and never reaches the browser.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Not the Sanity CDN: it can serve the pre-publish version for a few seconds, and a page regenerated in
  // that window (by the publish webhook, or a deploy built right after an edit) stays stale until the
  // next publish — seen 2026-10-17 on the home page. Next's own cache + tag revalidation sit in front of
  // this client, so reading the live API costs nothing in steady state.
  useCdn: false,
  perspective: "published",
  token: process.env.SANITY_API_READ_TOKEN,
  stega: { studioUrl },
});
