import { NextResponse, type NextRequest } from "next/server";
import { validate, type FormKey } from "@/lib/forms";
import { createLead, NotionNotConfigured } from "@/lib/notion";

/**
 * Contact-form submissions → Notion.
 * Spam defences (no third-party scripts): honeypot field, minimum fill time,
 * per-IP rate limit (best effort, per server instance), strict server-side validation.
 */

const MIN_FILL_MS = 3000;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: NextRequest) {
  let body: { form?: unknown; values?: unknown; hp?: unknown; startedAt?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const form = body.form === "portfolio-manager" || body.form === "allocator" ? (body.form as FormKey) : null;
  if (!form) return NextResponse.json({ error: "Unknown form" }, { status: 400 });

  // Honeypot filled or submitted implausibly fast: pretend success, store nothing.
  const startedAt = typeof body.startedAt === "number" ? body.startedAt : 0;
  if ((typeof body.hp === "string" && body.hp.trim() !== "") || Date.now() - startedAt < MIN_FILL_MS) {
    return NextResponse.json({ ok: true });
  }

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many submissions. Please try again later or email us." }, { status: 429 });
  }

  const result = validate(form, body.values);
  if (!result.ok) return NextResponse.json({ error: result.errors.join(". ") }, { status: 422 });

  try {
    await createLead(form, result.values);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NotionNotConfigured) {
      return NextResponse.json({ error: "This form isn't connected yet. Please email info@riptide-advisors.com." }, { status: 503 });
    }
    console.error("[lead] Notion write failed", err);
    return NextResponse.json(
      { error: "Sorry, something went wrong sending your message. Please email info@riptide-advisors.com." },
      { status: 502 },
    );
  }
}
