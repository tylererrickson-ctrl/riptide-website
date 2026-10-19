/**
 * One-off (2026-10-19, Tyler in chat): nav order For Investors → Reports →
 * For Portfolio Managers → Analytics, then the remaining pages in their
 * existing order. Reorders siteSettings.mainNav + footerNav (same link
 * objects, just reordered) on the published document and logs a publishRecord.
 *
 *   node --env-file=.env.local scripts/reorder-nav.mjs --dry
 *   node --env-file=.env.local scripts/reorder-nav.mjs
 */
import { createClient } from "@sanity/client";
import { createHash } from "node:crypto";

const DRY = process.argv.includes("--dry");
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-10-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});
const LEAD = ["/for-investors", "/reports", "/for-portfolio-managers", "/analytics"];

function reorder(nav) {
  const lead = LEAD.map((h) => nav.find((l) => l.href === h)).filter(Boolean);
  const rest = nav.filter((l) => !LEAD.includes(l.href));
  // Keep any leading items (e.g. footer "Home") ahead of the reordered block.
  const firstLeadIdx = nav.findIndex((l) => LEAD.includes(l.href));
  const before = rest.filter((l) => nav.indexOf(l) < firstLeadIdx);
  const after = rest.filter((l) => nav.indexOf(l) > firstLeadIdx);
  const out = [...before, ...lead, ...after];
  if (out.length !== nav.length) throw new Error("reorder lost or duplicated a link");
  return out;
}

if (await client.getDocument("drafts.siteSettings")) throw new Error("A Site settings draft exists in Studio — publish or discard it first.");
const s = await client.getDocument("siteSettings");
const mainNav = reorder(s.mainNav), footerNav = reorder(s.footerNav);
const show = (n) => n.map((l) => l.label).join(" · ");
console.log("mainNav:  ", show(s.mainNav), "\n        → ", show(mainNav));
console.log("footerNav:", show(s.footerNav), "\n        → ", show(footerNav));
if (DRY) process.exit(0);

const updated = await client.patch("siteSettings").ifRevisionId(s._rev).set({ mainNav, footerNav }).commit();
const { _rev, _createdAt, _updatedAt, ...snap } = updated;
const now = new Date().toISOString();
await client.create({
  _type: "publishRecord", documentId: "siteSettings", documentType: "siteSettings",
  documentTitle: updated.siteName ?? "Site settings", action: "publish", publishedAt: now,
  publishedBy: "Tyler Errickson (via Claude, scripts/reorder-nav.mjs)",
  approvedBy: "Tyler Errickson — requested in chat 2026-10-19", approvedAt: now,
  reviewNote: `Nav reordered: ${show(mainNav)}`,
  contentHash: createHash("sha256").update(JSON.stringify(snap)).digest("hex").slice(0, 16),
  snapshot: JSON.stringify(snap, null, 2),
});
console.log("published, rev", updated._rev);
