import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { client } from "@/sanity/client";

/**
 * Audit log for disclaimer-gate acceptances. Stores no raw personal data:
 * the IP is salted + hashed, so repeat visits can be correlated without storing the address.
 */
export async function POST(request: NextRequest) {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) return new NextResponse(null, { status: 204 });

  let body: { scope?: unknown; version?: unknown; path?: unknown };
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const scope = typeof body.scope === "string" ? body.scope.slice(0, 64) : null;
  const version = typeof body.version === "number" ? body.version : null;
  const path = typeof body.path === "string" ? body.path.slice(0, 200) : null;
  if (!scope || version === null) return new NextResponse(null, { status: 400 });

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const salt = process.env.GATE_LOG_SALT ?? "";
  const ipHash = ip ? createHash("sha256").update(salt + ip).digest("hex").slice(0, 32) : undefined;

  await client
    .withConfig({ token, useCdn: false, perspective: "raw" })
    .create({
      _type: "gateAcceptance",
      scope,
      version,
      path,
      acceptedAt: new Date().toISOString(),
      ipHash,
      userAgent: request.headers.get("user-agent")?.slice(0, 300),
      environment: process.env.VERCEL_ENV ?? "development",
    });
  return new NextResponse(null, { status: 204 });
}
