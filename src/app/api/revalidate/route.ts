import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { SITE_CACHE_TAG } from "@/sanity/live";

/**
 * Sanity publish webhook → refresh the site.
 * Every Sanity read is tagged SITE_CACHE_TAG, so one signed call marks all CMS content stale;
 * pages re-render on their next request. (The site is small; fine-grained tags aren't worth it.)
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ message: "Webhook secret not configured" }, { status: 500 });
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string; _id?: string }>(request, secret, true);
    if (!isValidSignature) return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    revalidateTag(SITE_CACHE_TAG, { expire: 0 });
    return NextResponse.json({ revalidated: true, type: body?._type, id: body?._id });
  } catch (err) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Error" }, { status: 400 });
  }
}
