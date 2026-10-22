/**
 * One-off (2026-10-22, Tyler in chat): Analytics page hero intro →
 * "Riptide Analytics is our secure portal for portfolio managers to upload
 * presentations, position data, trade data and returns."
 * Patches only that field on the published page and logs a publishRecord.
 *
 *   node --env-file=.env.local scripts/edit-analytics-intro.mjs --dry
 *   node --env-file=.env.local scripts/edit-analytics-intro.mjs
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
const INTRO = "Riptide Analytics is our secure portal for portfolio managers to upload presentations, position data, trade data and returns.";

if (await client.getDocument(`drafts.${ID}`)) throw new Error("A draft of this page exists in Studio — publish or discard it first.");
const page = await client.getDocument(ID);
const hero = page.sections.find((s) => s._type === "heroPage");
if (!hero) throw new Error("hero section not found");
console.log(`before: ${hero.intro}\nafter:  ${INTRO}`);
if (hero.intro === INTRO) { console.log("already done"); process.exit(0); }
if (DRY) process.exit(0);

const updated = await client.patch(ID).ifRevisionId(page._rev).set({ [`sections[_key=="${hero._key}"].intro`]: INTRO }).commit();
const { _rev, _createdAt, _updatedAt, ...snap } = updated;
const now = new Date().toISOString();
await client.create({
  _type: "publishRecord", documentId: ID, documentType: "page", documentTitle: updated.title,
  action: "publish", publishedAt: now,
  publishedBy: "Tyler Errickson (via Claude, scripts/edit-analytics-intro.mjs)",
  approvedBy: "Tyler Errickson — requested in chat 2026-10-22", approvedAt: now,
  reviewNote: `Analytics hero intro: "${hero.intro}" → "${INTRO}"`,
  contentHash: createHash("sha256").update(JSON.stringify(snap)).digest("hex").slice(0, 16),
  snapshot: JSON.stringify(snap, null, 2),
});
console.log("published, rev", updated._rev);
