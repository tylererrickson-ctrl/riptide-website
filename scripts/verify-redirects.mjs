#!/usr/bin/env node
/**
 * Verifies every row of migration/redirects.csv against a running deployment,
 * plus trailing-slash handling and real 404s.
 *   node scripts/verify-redirects.mjs [baseUrl] [--header "name: value"]
 */
import { loadRedirectRows } from "../src/config/redirects.mjs";

const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const hi = process.argv.indexOf("--header");
const headers = hi > 0 ? Object.fromEntries([process.argv[hi + 1].split(/:\s*/)]) : {};
const rows = loadRedirectRows();
let fail = 0;

async function check(path, expectStatus, expectLocation) {
  const res = await fetch(base + path, { redirect: "manual", headers });
  const loc = res.headers.get("location");
  const locPath = loc ? (loc.startsWith("http") && loc.startsWith(base) ? loc.slice(base.length) || "/" : loc) : null;
  const norm = (u) => (u && /^https?:\/\/[^/]+\/$/.test(u) ? u.slice(0, -1) : u); // "https://x.com/" == "https://x.com"
  const ok = res.status === expectStatus && (expectLocation === undefined || norm(locPath) === norm(expectLocation));
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${String(res.status).padEnd(3)} ${path.padEnd(40)} ${locPath ? "→ " + locPath : ""}${ok ? "" : `   (expected ${expectStatus}${expectLocation ? " → " + expectLocation : ""})`}`);
}

for (const r of rows) {
  if (!r.old_url.startsWith("/") || r.old_url.includes("*")) continue;
  // The privacy policy is draft-only until compliance supplies it (blocker #2), so it 404s for now.
  if (r.status === "200") await check(r.old_url, 200);
  else await check(r.old_url, Number(r.status), r.new_url);
}
await check("/contact/", 301, "/contact");
await check("/for-investors/", 301, "/for-investors");
await check("/principles/", 301, "/our-principles"); // redirect rules also match the trailing-slash form (one hop)
await check("/this-page-does-not-exist", 404);
await check("/CONTACT", 404);
await check("/blog", 404);
console.log(fail ? `\n${fail} check(s) failed` : "\nAll checks passed");
process.exit(fail ? 1 : 0);
