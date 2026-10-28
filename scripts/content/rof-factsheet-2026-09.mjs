#!/usr/bin/env node
/**
 * Monthly update of the Riptide Opportunities Fund page (/rof) to
 * "Riptide_Opportunities_Fund_Factsheet_September_2026.pdf" (supplied by Tyler, 2026-10-28).
 * Patches the performance content in place (by section/item _key) — text verbatim from the
 * factsheet, figures as printed (none recomputed). Everything Tyler changed on the site
 * after the August load is left alone: intro paragraph, "Multi-strategy" wording, Min Invest
 * $250K, prime brokers (Clear Street, Goldman Sachs), legal counsel (Royer Cooper Cohen
 * Braunfeld) — the factsheet still prints the older values for those.
 * Headline annualized return keeps the period label (Mar–Sep 2026, 13.14%, from the commentary).
 *
 *   node --env-file=.env.local scripts/content/rof-factsheet-2026-09.mjs --dry
 *   node --env-file=.env.local scripts/content/rof-factsheet-2026-09.mjs
 */
import { createClient } from "@sanity/client";
import { createHash } from "node:crypto";

const DRY = process.argv.includes("--dry");
const c = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-10-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});
const ID = "page-rof";
const S = (k) => `sections[_key=="${k}"]`;
const F = (sec, k) => `${S(sec)}.facts[_key=="${k}"]`;
const bar = (k, label, value, note) => ({ _key: k, _type: "bar", label, value, note });
const row = (k, cells, total = false) => ({ _key: k, _type: "tableRow", cells, ...(total ? { total } : {}) });

const set = {
  // hero
  [`${S("rof0024")}.eyebrow`]: "Multi-strategy fund · Factsheet: September 2026 · For qualified purchasers only",
  // Performance Characteristics
  [`${S("rof0025")}.rail.caption`]: "As of 30-Sep-2026",
  [`${F("rof0025", "rof0006")}.value`]: "+7.56%",
  [`${F("rof0025", "rof0007")}.label`]: "Annualized Return (Mar–Sep 2026)",
  [`${F("rof0025", "rof0007")}.value`]: "13.14%",
  [`${F("rof0025", "rof0008")}.value`]: "2.9%",
  [`${F("rof0025", "rof0009")}.value`]: "3.5x",
  [`${F("rof0025", "rof000a")}.value`]: "+2.61%",
  [`${F("rof0025", "rof000b")}.value`]: "+0.02%",
  [`${F("rof0025", "rof000c")}.value`]: "9 / 9",
  [`${F("rof0025", "rof000d")}.value`]: "N/A",
  [`${F("rof0025", "rof000e")}.value`]: "0.1",
  // Growth of $1,000 + monthly table
  [`${S("rof0026")}.asOf`]: "2026-09-30",
  [`${S("rof0026")}.years[_key=="rof000g"].fund`]: [0.02, 0.07, 1.49, 1.4, 2.61, 0.42, 0.55, 0.43, 0.36],
  [`${S("rof0026")}.years[_key=="rof000g"].benchmark`]: [1.45, -0.76, -4.98, 10.49, 5.26, -0.95, -0.06, 2.72, -0.35],
  [`${S("rof0026")}.years[_key=="rof000g"].fundYtd`]: 7.56,
  [`${S("rof0026")}.years[_key=="rof000g"].benchmarkYtd`]: 12.74,
  // Commentary
  [`${S("rof0027")}.heading`]: "September 2026 Commentary",
  [`${S("rof0027")}.rail.caption`]: "September 2026",
  [`${S("rof0027")}.body[_key=="rof000h"].children[_key=="rof000i"].text`]:
    "The Riptide Opportunities Fund generated a +0.36% net return in September, a ninth consecutive positive month, while the SPX Index (total return) fell -0.35%. Three of the five sub-strategies contributed. Fundamental L/S was the largest driver at +0.15% (42% of the month’s return), with Tactical close behind at +0.15% (41%) and Systematic adding +0.06% (17%). Market Neutral and Macro did not contribute to performance in September.",
  [`${S("rof0027")}.body[_key=="rof000j"].children[_key=="rof000k"].text`]:
    "September was the fifth month this year in which the Fund posted a gain while the index declined, which is the profile the platform is built to deliver. Realized volatility eased to 2.9% across nine months and the Sharpe stands at 3.5x. We continue to favor diversified, complementary return streams across Fundamental L/S, Tactical, Systematic, Market-Neutral and Macro managers, and remain focused on preserving capital while compounding above each manager’s high-water mark.",
  [`${S("rof0027")}.body[_key=="rof000l"].children[_key=="rof000m"].text`]:
    "On an annualized basis, the Fund has returned 10.20% over its first nine months. Because capital was still ramping and held largely in cash during January and February, the period since March remains more representative of the platform at scale: over the seven months from March through September, the Fund has annualized 13.14%.",
  // Strategy drivers
  [`${S("rof0028")}.heading`]: "September Strategy Drivers",
  [`${S("rof0028")}.bars`]: [
    bar("rof0901", "Fundamental L/S", 0.15, "Largest driver — 42% of the month’s return."),
    bar("rof0902", "Tactical", 0.15, "Close second — 41% of return."),
    bar("rof0903", "Systematic", 0.06, "Contributor — 17% of return."),
    bar("rof0904", "Market Neutral", 0, "Did not contribute this month."),
    bar("rof0905", "Macro", 0, "Did not contribute this month."),
  ],
  // Exposure by strategy
  [`${S("rof0029")}.rows`]: [
    row("rof0911", ["Systematic", "60.1%", "3"]),
    row("rof0912", ["Fundamental L/S", "27.1%", "7"]),
    row("rof0913", ["Tactical", "8.1%", "2"]),
    row("rof0914", ["Macro", "3.1%", "1"]),
    row("rof0915", ["Market Neutral", "1.6%", "1"]),
    row("rof0916", ["Total", "100.0%", "14"], true),
  ],
  // Diversification notes
  [`${S("rof002a")}.body[_key=="rof000y"].children[_key=="rof000z"].text`]:
    "The Fund is allocated across five uncorrelated strategy buckets spanning fourteen portfolio managers, with risk attribution diversified to minimize correlation and drawdown.",
};

if (await c.getDocument(`drafts.${ID}`)) throw new Error("A draft of this page exists in Studio — publish or discard it first.");
const page = await c.getDocument(ID);
const keys = new Set(page.sections.map((s) => s._key));
for (const k of ["rof0024", "rof0025", "rof0026", "rof0027", "rof0028", "rof0029", "rof002a"]) {
  if (!keys.has(k)) throw new Error(`section ${k} not found — page structure changed; re-check before patching`);
}
console.log(`${Object.keys(set).length} fields to set on ${ID} (rev ${page._rev})`);
if (DRY) process.exit(0);

const updated = await c.patch(ID).ifRevisionId(page._rev).set(set).commit();
const { _rev, _createdAt, _updatedAt, ...snap } = updated;
const now = new Date().toISOString();
await c.create({
  _type: "publishRecord", documentId: ID, documentType: "page", documentTitle: updated.title ?? "Riptide Opportunities Fund",
  action: "publish", publishedAt: now,
  publishedBy: "Tyler Errickson (factsheet supplied in chat; applied via API by Claude, scripts/content/rof-factsheet-2026-09.mjs)",
  approvedBy: "Tyler Errickson — requested in chat 2026-10-28 (\"Please update performance page\")", approvedAt: now,
  reviewNote: "September 2026 factsheet: performance characteristics, growth/monthly table, commentary, strategy drivers, exposure by strategy, manager count. Site-specific terms and wording unchanged.",
  contentHash: createHash("sha256").update(JSON.stringify(snap)).digest("hex").slice(0, 16),
  snapshot: JSON.stringify(snap, null, 2),
});
console.log("published, rev", updated._rev);
