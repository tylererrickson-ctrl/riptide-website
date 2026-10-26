/**
 * One-off (2026-10-26, Tyler in chat): Analytics page "Analytics Portal" button →
 * https://analytics.riptide-advisors.com (Riptide Analytics moved off riptide-analytics.vercel.app).
 * Patches only that CTA's href on the published page and logs a publishRecord.
 *
 *   node --env-file=.env.local scripts/edit-analytics-link.mjs --dry
 *   node --env-file=.env.local scripts/edit-analytics-link.mjs
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
const ID = "page-analytics";
const OLD = "https://riptide-analytics.vercel.app";
const NEW = "https://analytics.riptide-advisors.com";

if (await client.getDocument(`drafts.${ID}`)) throw new Error("A draft of this page exists in Studio — publish or discard it first.");
const page = await client.getDocument(ID);
const hero = page.sections.find((s) => s._type === "heroPage");
if (!hero) throw new Error("hero section not found");
const cta = (hero.ctas || []).find((c) => JSON.stringify(c).includes(OLD) || JSON.stringify(c).includes(NEW));
if (!cta) throw new Error(`no CTA pointing at ${OLD} found`);
const field = Object.keys(cta).find((k) => typeof cta[k] === "string" && cta[k].startsWith("http"));
if (!field) throw new Error(`CTA has no URL field: ${JSON.stringify(cta)}`);
console.log(`CTA "${cta.label ?? cta.text ?? cta._key}" ${field}:\nbefore: ${cta[field]}\nafter:  ${NEW}`);
if (cta[field] === NEW) { console.log("already done"); process.exit(0); }
if (DRY) process.exit(0);

const path = `sections[_key=="${hero._key}"].ctas[_key=="${cta._key}"].${field}`;
const updated = await client.patch(ID).ifRevisionId(page._rev).set({ [path]: NEW }).commit();
const { _rev, _createdAt, _updatedAt, ...snap } = updated;
const now = new Date().toISOString();
await client.create({
  _type: "publishRecord", documentId: ID, documentType: "page", documentTitle: updated.title,
  action: "publish", publishedAt: now,
  publishedBy: "Tyler Errickson (via Claude, scripts/edit-analytics-link.mjs)",
  approvedBy: "Tyler Errickson — requested in chat 2026-10-26", approvedAt: now,
  reviewNote: `Analytics Portal button: ${cta[field]} → ${NEW}`,
  contentHash: createHash("sha256").update(JSON.stringify(snap)).digest("hex").slice(0, 16),
  snapshot: JSON.stringify(snap, null, 2),
});
console.log("published, rev", updated._rev);
