/**
 * One-off (2026-10-19, Tyler in chat): For Investors → investor path, steps
 * "Riptide Flexible Capital Fund" and "Direct Investments": append
 * "Riptide charges no fees." (Tyler chose "no Riptide fees" wording — the
 * underlying managers may still earn their own performance fees.)
 * Patches only those two step bodies on the published page; logs a publishRecord.
 *
 *   node --env-file=.env.local scripts/edit-investor-fees.mjs --dry
 *   node --env-file=.env.local scripts/edit-investor-fees.mjs
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
const ID = "page-for-investors";
const SUFFIX = "Riptide charges no fees.";
const TITLES = ["Riptide Flexible Capital Fund", "Direct Investments"];

if (await client.getDocument(`drafts.${ID}`)) throw new Error("A draft of this page exists in Studio — publish or discard it first.");
const page = await client.getDocument(ID);
const set = {};
const notes = [];
for (const sec of page.sections) {
  for (const st of sec.steps || []) {
    if (!TITLES.includes(st.title)) continue;
    if (st.body.includes(SUFFIX)) { console.log(`already done: ${st.title}`); continue; }
    const body = `${st.body.trim()} ${SUFFIX}`;
    set[`sections[_key=="${sec._key}"].steps[_key=="${st._key}"].body`] = body;
    notes.push(`${st.title}: "${st.body}" → "${body}"`);
    console.log(`${st.title}\n  before: ${st.body}\n  after:  ${body}`);
  }
}
if (!Object.keys(set).length) { console.log("nothing to change"); process.exit(0); }
if (DRY) process.exit(0);

const updated = await client.patch(ID).ifRevisionId(page._rev).set(set).commit();
const { _rev, _createdAt, _updatedAt, ...snap } = updated;
const now = new Date().toISOString();
await client.create({
  _type: "publishRecord", documentId: ID, documentType: "page", documentTitle: updated.title,
  action: "publish", publishedAt: now,
  publishedBy: "Tyler Errickson (via Claude, scripts/edit-investor-fees.mjs)",
  approvedBy: "Tyler Errickson — requested in chat 2026-10-19 (wording: no Riptide fees)", approvedAt: now,
  reviewNote: notes.join("\n"),
  contentHash: createHash("sha256").update(JSON.stringify(snap)).digest("hex").slice(0, 16),
  snapshot: JSON.stringify(snap, null, 2),
});
console.log("published, rev", updated._rev);
