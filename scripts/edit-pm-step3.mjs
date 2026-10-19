/**
 * One-off (2026-10-19, Tyler in chat): For Portfolio Managers → "A Structured Path for
 * Talent to Grow" step 3: "Capital Hosting" → "Direct Investments", with new body copy
 * (body revised again 2026-10-19).
 * Patches only that step on the published page and logs a publishRecord.
 *
 *   node --env-file=.env.local scripts/edit-pm-step3.mjs --dry
 *   node --env-file=.env.local scripts/edit-pm-step3.mjs
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
const ID = "page-for-portfolio-managers";
const TITLE = "Direct Investments";
const BODY = "Scale your fund with platform capital, external SMAs and direct investments with full operations and compliance support.";

if (await client.getDocument(`drafts.${ID}`)) throw new Error("A draft of this page exists in Studio — publish or discard it first.");
const page = await client.getDocument(ID);
const stepper = page.sections.find((s) => s._type === "stepper" && (s.steps || []).some((st) => st.title === "Capital Hosting" || st.title === TITLE));
if (!stepper) throw new Error("stepper with the Capital Hosting step not found");
const step = stepper.steps.find((st) => st.title === "Capital Hosting" || st.title === TITLE);
console.log(`before: "${step.title}" — ${step.body}`);
console.log(`after:  "${TITLE}" — ${BODY}`);
if (DRY) process.exit(0);

const base = `sections[_key=="${stepper._key}"].steps[_key=="${step._key}"]`;
const updated = await client
  .patch(ID)
  .ifRevisionId(page._rev)
  .set({ [`${base}.title`]: TITLE, [`${base}.body`]: BODY })
  .commit();
const { _rev, _createdAt, _updatedAt, ...snap } = updated;
const now = new Date().toISOString();
await client.create({
  _type: "publishRecord",
  documentId: ID,
  documentType: "page",
  documentTitle: updated.title,
  action: "publish",
  publishedAt: now,
  publishedBy: "Tyler Errickson (via Claude, scripts/edit-pm-step3.mjs)",
  approvedBy: "Tyler Errickson — requested in chat 2026-10-19",
  approvedAt: now,
  reviewNote: `Step 3 "${step.title}" → "${TITLE}"; body: "${step.body}" → "${BODY}"`,
  contentHash: createHash("sha256").update(JSON.stringify(snap)).digest("hex").slice(0, 16),
  snapshot: JSON.stringify(snap, null, 2),
});
console.log("published, rev", updated._rev);
