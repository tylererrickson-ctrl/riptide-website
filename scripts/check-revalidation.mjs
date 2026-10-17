#!/usr/bin/env node
/**
 * Regression test for publish-time regeneration: fires a signed revalidation
 * (as the Sanity webhook does), then fetches every page repeatedly and checks
 * each one regenerates with HTTP 200 and its H1 intact.
 *   node --env-file=.env.local scripts/check-revalidation.mjs [baseUrl] [--header "name: value"]
 */
import { createHmac } from "node:crypto";

const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const hi = process.argv.indexOf("--header");
const extra = hi > 0 ? Object.fromEntries([process.argv[hi + 1].split(/:\s*/)]) : {};
const pages = ["/", "/for-portfolio-managers", "/for-investors", "/our-principles", "/risk", "/contact", "/about", "/services"];

const body = JSON.stringify({ _type: "page", _id: "regeneration-check" });
const ts = Date.now();
const sig = createHmac("sha256", process.env.SANITY_WEBHOOK_SECRET).update(`${ts}.${body}`).digest("base64url");
const r = await fetch(`${base}/api/revalidate`, {
  method: "POST",
  headers: { "content-type": "application/json", "sanity-webhook-signature": `t=${ts},v1=${sig}`, ...extra },
  body,
});
console.log("revalidate:", r.status, await r.text());

let fail = 0;
for (let round = 1; round <= 3; round++) {
  for (const p of pages) {
    const res = await fetch(base + p, { headers: extra });
    const html = await res.text();
    const h1 = html.match(/<h1[^>]*>([^<]{0,60})/)?.[1];
    const ok = res.status === 200 && !!h1;
    if (!ok) fail++;
    if (!ok || round === 3) console.log(`${ok ? "PASS" : "FAIL"} round ${round} ${res.status} ${p.padEnd(26)} h1=${h1 ?? "(missing)"}`);
  }
  await new Promise((r) => setTimeout(r, 1500));
}
console.log(fail ? `${fail} failure(s)` : "All pages regenerate cleanly");
process.exit(fail ? 1 : 0);
