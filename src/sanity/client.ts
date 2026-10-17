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
  useCdn: true,
  perspective: "published",
  token: process.env.SANITY_API_READ_TOKEN,
  stega: { studioUrl },
});
