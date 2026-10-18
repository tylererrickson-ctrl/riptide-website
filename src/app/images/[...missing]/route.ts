/**
 * Real files in public/images are served by the static file handler before any route runs, so this
 * only catches images that don't exist (e.g. the retired Wix banners). Without it they fell through
 * to the CMS catch-all page and answered "200" with an empty page instead of a 404.
 */
export function GET() {
  return new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
}
