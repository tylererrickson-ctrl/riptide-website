import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs after next.config redirects (migration/redirects.csv), before rendering.
 *  1. Strips trailing slashes with a 301 (Wix did the same; Next's built-in is a 308).
 *  2. Returns a real HTTP 404 for paths that aren't published CMS pages. Pages stream
 *     with a 200 once rendering starts, so the status has to be decided here.
 */

const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const TOKEN = process.env.SANITY_API_READ_TOKEN;
const TTL_MS = 60_000;

let cache: { at: number; paths: Set<string> } | null = null;

async function publishedPaths(): Promise<Set<string> | null> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.paths;
  if (!PROJECT || !DATASET) return null;
  const query = encodeURIComponent('*[_type == "page" && defined(path) && !(_id in path("drafts.**"))].path');
  try {
    const res = await fetch(`https://${PROJECT}.apicdn.sanity.io/v2026-10-01/data/query/${DATASET}?query=${query}&perspective=published`, {
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : undefined,
      cache: "no-store",
    });
    if (!res.ok) return cache?.paths ?? null;
    const { result } = (await res.json()) as { result: string[] };
    cache = { at: Date.now(), paths: new Set(result) };
    return cache.paths;
  } catch {
    return cache?.paths ?? null; // fail open: never take the site down because Sanity is unreachable
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.length > 1 && pathname.endsWith("/")) {
    // Plain URL: NextURL would re-apply the trailing slash on serialisation.
    const url = new URL(request.url);
    url.pathname = pathname.replace(/\/+$/, "") || "/";
    return NextResponse.redirect(url.toString(), 301);
  }

  // Editors previewing drafts (Presentation tool) may open unpublished paths.
  if (request.cookies.has("__prerender_bypass")) return NextResponse.next();

  const paths = await publishedPaths();
  if (paths && !paths.has(pathname)) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Everything except Next internals, API routes, the Studio, metadata files and static assets.
    "/((?!_next/|api/|studio|images/|favicon|robots\\.txt|sitemap\\.xml|icon|apple-icon|opengraph-image|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
