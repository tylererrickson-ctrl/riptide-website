/**
 * One-off (2026-10-18): publishes the drafts written by add-reports-page.mjs
 * (drafts.page-reports + drafts.siteSettings) and logs a publishRecord for
 * each, same shape as the content import. Approved by Tyler in chat.
 *
 *   node --env-file=.env.local scripts/publish-reports-page.mjs --dry
 *   node --env-file=.env.local scripts/publish-reports-page.mjs
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
const strip = ({ _rev, _createdAt, _updatedAt, ...rest }) => rest;
const now = new Date().toISOString();
const tx = client.transaction();

for (const id of ["page-reports", "siteSettings"]) {
  const draft = await client.getDocument(`drafts.${id}`);
  if (!draft) throw new Error(`no draft for ${id} — nothing to publish`);
  const doc = { ...strip(draft), _id: id };
  if (doc.review) doc.review = { ...doc.review, status: "published" };
  console.log(`publish ${id}${id === "siteSettings" ? ": mainNav = " + doc.mainNav.map((l) => l.label).join(" · ") : ` (${doc.path})`}`);
  tx.createOrReplace(doc).delete(`drafts.${id}`).create({
    _type: "publishRecord",
    documentId: id,
    documentType: doc._type,
    documentTitle: doc.title ?? doc.siteName ?? id,
    action: "publish",
    publishedAt: now,
    publishedBy: "Tyler Errickson (via Claude, scripts/publish-reports-page.mjs)",
    approvedBy: "Tyler Errickson — approved in chat 2026-10-18",
    approvedAt: now,
    reviewNote: "Adds the Reports page (button to portal.riptide-advisors.com) and a Reports nav link after Analytics.",
    contentHash: createHash("sha256").update(JSON.stringify(doc)).digest("hex").slice(0, 16),
    snapshot: JSON.stringify(doc, null, 2),
  });
}
if (DRY) console.log("--dry: nothing written");
else console.log("committed:", (await tx.commit()).transactionId);
