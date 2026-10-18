/**
 * One-off (2026-10-18): adds the "Reports" landing page (button out to the
 * allocator portal, portal.riptide-advisors.com) and a "Reports" nav link
 * right after "Analytics" in the header and footer — as Sanity DRAFTS only.
 * Nothing is live until someone publishes the drafts in Studio (/studio).
 *
 *   node --env-file=.env.local scripts/add-reports-page.mjs --dry   # print, don't write
 *   node --env-file=.env.local scripts/add-reports-page.mjs
 *
 * Safe to re-run: page draft is createOrReplace'd; a nav link already
 * pointing at /reports isn't added twice; an existing siteSettings draft is
 * edited in place instead of overwritten.
 */
import { createClient } from "@sanity/client";
import { randomBytes } from "node:crypto";

const DRY = process.argv.includes("--dry");
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-10-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});
const key = () => `k${randomBytes(5).toString("hex")}`;
const PORTAL = "https://portal.riptide-advisors.com";

const analytics = await client.getDocument("page-analytics");
if (!analytics) throw new Error("page-analytics not found — expected to copy its SEO image");

const page = {
  _id: "drafts.page-reports",
  _type: "page",
  title: "Reports",
  path: "/reports",
  seo: {
    ...analytics.seo,
    title: "Strategy Reports | Riptide Advisors",
    description: "Riptide Strategy Reports: the secure portal where allocators view the latest finalized performance reports for their strategies.",
  },
  sections: [{
    _key: key(),
    _type: "heroPage",
    heading: "Strategy Reports",
    intro: "Strategy Reports is our secure portal for allocators to view the latest finalized performance reports for the strategies they follow and to request updates.",
    ctas: [{ _key: key(), _type: "link", label: "Reports Portal", href: PORTAL }],
  }],
  review: { _type: "review", status: "editing" },
};

const draftSettings = await client.getDocument("drafts.siteSettings");
const base = draftSettings ?? (await client.getDocument("siteSettings"));
if (!base) throw new Error("siteSettings not found");
const linkTemplate = (base.mainNav || []).find((l) => l.href === "/analytics");

function insertAfterAnalytics(nav = []) {
  if (nav.some((l) => l.href === "/reports")) return nav;
  const i = nav.findIndex((l) => l.href === "/analytics");
  const item = { ...(linkTemplate ?? { _type: "link" }), _key: key(), label: "Reports", href: "/reports" };
  const out = [...nav];
  out.splice(i >= 0 ? i + 1 : out.length, 0, item);
  return out;
}

const settings = {
  ...base,
  _id: "drafts.siteSettings",
  mainNav: insertAfterAnalytics(base.mainNav),
  footerNav: insertAfterAnalytics(base.footerNav),
};
delete settings._rev;
delete settings._updatedAt;
delete settings._createdAt;

const show = (nav) => nav.map((l) => l.label).join(" · ");
console.log("page draft:", page._id, page.path, "→", PORTAL);
console.log(`siteSettings draft (from ${draftSettings ? "existing draft" : "published"}):`);
console.log("  mainNav:  ", show(settings.mainNav));
console.log("  footerNav:", show(settings.footerNav));

if (DRY) {
  console.log("--dry: nothing written");
} else {
  await client.transaction().createOrReplace(page).createOrReplace(settings).commit();
  console.log("Drafts written. Review and publish in Studio: /studio (Pages → Reports, and Site settings).");
}
