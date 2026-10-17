#!/usr/bin/env node
/**
 * Loads the Phase 1 content export (content/*.md, public/images/*) into Sanity.
 *
 *   npm run content:import            # needs NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN in .env.local
 *   npm run content:import -- --dry   # print documents without writing
 *
 * Idempotent: fixed document ids + createOrReplace; image assets are de-duplicated by Sanity (content hash).
 * Copy is verbatim from the Wix export; only ALL-CAPS headings were normalised to sentence case
 * (uppercase styling is applied in CSS). Every change from the export is listed in migration/content-import-notes.md.
 *
 * Seeded documents are published directly (this is the reviewed migration baseline) and each gets a
 * publishRecord noting it came from the migration. Exception: the privacy policy is imported as a DRAFT
 * because the Wix page is placeholder template text (see migration/site-inventory.md, blocker #2).
 */
import { createClient } from "@sanity/client";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const DRY = process.argv.includes("--dry");
const ROOT = path.resolve(import.meta.dirname, "..");

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "dryrun00",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-10-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

if (!DRY && (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_WRITE_TOKEN)) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN (.env.local)");
  process.exit(1);
}

// ---------- helpers ----------
let k = 0;
const key = () => `k${(++k).toString(36).padStart(5, "0")}`;
const span = (text, marks = []) => ({ _type: "span", _key: key(), text, marks });
const block = (text, style = "normal") => ({ _type: "block", _key: key(), style, markDefs: [], children: [span(text)] });
const bullet = (text) => ({ ...block(text), listItem: "bullet", level: 1 });
const linkBlock = (before, label, href, after = "") => {
  const m = key();
  return {
    _type: "block", _key: key(), style: "normal",
    markDefs: [{ _type: "link", _key: m, href }],
    children: [span(before), span(label, [m]), ...(after ? [span(after)] : [])].filter((c) => c.text),
  };
};
const link = (label, href) => ({ _type: "link", label, href });
const linkItem = (label, href) => ({ _key: key(), ...link(label, href) });
const rail = (number, label, caption) => ({ _type: "rail", ...(number ? { number } : {}), label, ...(caption ? { caption } : {}) });

const assetCache = new Map();
async function image(file, alt) {
  if (DRY) return { _type: "image", alt, asset: { _type: "reference", _ref: `image-DRY-${file}` } };
  if (!assetCache.has(file)) {
    const buf = await readFile(path.join(ROOT, "public/images", file));
    const asset = await client.assets.upload("image", buf, { filename: file });
    assetCache.set(file, asset._id);
    console.log(`  ↑ ${file}`);
  }
  return { _type: "image", ...(alt !== undefined ? { alt } : {}), asset: { _type: "reference", _ref: assetCache.get(file) } };
}

const seo = (title, description, ogImage) => ({ _type: "seo", title, ...(description ? { description } : {}), ...(ogImage ? { ogImage } : {}), noindex: false });

// ---------- documents ----------
async function build() {
  const og = await image("og-default.png", "Riptide Advisors");

  const team = [
    { _id: "team-tyler-errickson", name: "Tyler Errickson", role: "Chief Executive Officer", order: 1,
      linkedin: "https://www.linkedin.com/in/tylererricksoncfa/", photo: await image("team-tyler-errickson.png", "Tyler Errickson") },
    { _id: "team-andrew-heinemann", name: "Andrew Heinemann", role: "Chief Operating Officer", order: 2,
      linkedin: "https://www.linkedin.com/in/andrew-heinemann-7147bb26/", photo: await image("team-andrew-heinemann.jpg", "Andrew Heinemann") },
    { _id: "team-spencer-gantsoudes", name: "Spencer Gantsoudes", role: "Head of Manager Research", order: 3,
      linkedin: "https://www.linkedin.com/in/spencer-gantsoudes-cfa-70146b1a/", photo: await image("team-spencer-gantsoudes.png", "Spencer Gantsoudes") },
  ].map((m) => ({ _type: "teamMember", ...m }));

  const placeholderBody = [
    block("PLACEHOLDER — awaiting compliance wording.", "h3"),
    block(
      "Riptide compliance will supply the exact regulatory text for this notice. It must be pasted here verbatim and approved through the review workflow before launch. Do not publish this placeholder to production.",
    ),
  ];
  const disclaimers = [
    { _id: "disclaimer-investors", title: "Investor notice (PLACEHOLDER)", scope: { _type: "slug", current: "investors" }, version: 1,
      kicker: "Legal disclaimer", heading: "Important Regulatory Information",
      instruction: "Please read the notice below carefully. You must accept the terms before you can proceed.",
      body: placeholderBody, acceptLabel: "Accept & enter", declineLabel: "Decline", declineHref: "/",
      requireScroll: false, persistence: "session", logAcceptance: true, source: "PLACEHOLDER - compliance to supply" },
    { _id: "disclaimer-site", title: "Site disclaimer (PLACEHOLDER)", scope: { _type: "slug", current: "site" }, version: 1,
      kicker: "Legal disclaimer", heading: "Important Information",
      body: placeholderBody, acceptLabel: "Accept", declineLabel: "Close", declineHref: "/",
      requireScroll: false, persistence: "session", logAcceptance: false, source: "PLACEHOLDER - compliance to supply" },
  ].map((d) => ({ _type: "disclaimer", ...d }));

  const settings = {
    _id: "siteSettings", _type: "siteSettings",
    siteName: "Riptide Advisors",
    defaultDescription: "Riptide Advisors. Uncorrelated Returns. SMAs. Extraordinary People.",
    ogImage: og,
    email: "info@riptide-advisors.com",
    addressLines: ["12 Havemeyer Place", "Greenwich CT 06830"],
    locationShort: "Greenwich, CT",
    linkedin: "https://www.linkedin.com/company/riptide-advisors/",
    headerCta: link("Contact us", "/contact"),
    mainNav: [
      linkItem("Analytics", "/analytics"),
      linkItem("For investors", "/for-investors"),
      linkItem("Performance", "/rof"),
      linkItem("For portfolio managers", "/for-portfolio-managers"),
      linkItem("Principles", "/our-principles"),
      linkItem("Risk", "/risk"),
    ],
    footerTagline: "Access to differentiated active strategies, lower all-in fees, improved liquidity, and better transparency through SMAs.",
    footerNav: [
      linkItem("Home", "/"),
      linkItem("For Portfolio Managers", "/for-portfolio-managers"),
      linkItem("For Investors", "/for-investors"),
      linkItem("Performance", "/rof"),
      linkItem("Principles", "/our-principles"),
      linkItem("Contact Us", "/contact"),
    ],
    legalLinks: [linkItem("Privacy policy", "/english-privacy-policy")],
    siteDisclaimer: { _type: "reference", _ref: "disclaimer-site" },
  };

  const teamRefs = team.map((m) => ({ _type: "reference", _ref: m._id, _key: key() }));

  const pages = [
    {
      _id: "page-home", title: "Home", path: "/",
      seo: seo("Riptide Advisors | Emerging Managers", "Riptide Advisors. Uncorrelated Returns. SMAs. Extraordinary People.", await image("logo-horizontal-color-600.png", "Riptide Advisors")),
      sections: [
        { _type: "heroPortal", eyebrow: "Riptide Advisors",
          heading: "Navigating Alternative Investments",
          subheading: "We offer multi-manager funds and custom managed accounts to allocators seeking early access to differentiated investment performance.",
          image: await image("home-hero-banner.png", ""),
          panels: [
            { _key: key(), _type: "portalPanel", meta: "Capital solutions · Operating solutions", title: "For portfolio managers",
              tagline: "We provide the institutional infrastructure, operational support, and capital pathways portfolio managers need to launch strategies, scale efficiently, and focus on delivering performance.",
              link: link("Explore more", "/for-portfolio-managers") },
            { _key: key(), _type: "portalPanel", meta: "Multi-manager funds · Custom managed accounts", title: "For capital partners",
              tagline: "We provide capital partners with differentiated access to high-quality investment strategies, supported by institutional-grade infrastructure and disciplined risk management.",
              link: link("Explore more", "/for-investors") },
          ],
          strip: { tagline: "Guiding values for our firm", link: link("Read our principles", "/our-principles") } },
        { _type: "statement", rail: rail(undefined, "Our philosophy"), eyebrow: "Our philosophy",
          text: "Great investment talent creates its own momentum.",
          body: "Our role is to provide the infrastructure, capital, and alignment to accelerate that trajectory and give both managers and allocators a better way to participate in its growth.",
          cta: link("Contact now", "/contact") },
        { _type: "explainer", tone: "dark", rail: rail(undefined, "Our specialities"),
          tags: ["Uncorrelated returns", "Aligned partnerships", "Operational oversight", "Risk management"] },
        { _type: "teamGrid", rail: rail(undefined, "Our team"), members: teamRefs },
        { _type: "contactBlock", rail: rail(undefined, "Connect"),
          body: "Ready to explore how Riptide can support your investment goals? We’re here to help you build, scale, or allocate with clarity and confidence.",
          showEmail: true, showLocation: true, cta: link("Contact us", "/contact") },
      ],
    },
    {
      _id: "page-for-portfolio-managers", title: "For Portfolio Managers", path: "/for-portfolio-managers",
      seo: seo("FOR PORTFOLIO MANAGERS | Riptide Advisors", null, og),
      sections: [
        { _type: "heroPage", eyebrow: "For portfolio managers", heading: "For portfolio managers",
          intro: "We provide the institutional infrastructure, operational support, and capital pathways portfolio managers need to launch strategies, scale efficiently, and focus on delivering performance.",
          image: await image("for-portfolio-managers-banner.png", ""),
          ctas: [linkItem("Idea Hub", "/idea-hub"), linkItem("Get started", "/contact")] },
        { _type: "stepper", rail: rail("01", "Capital solutions"), eyebrow: "Capital solutions", heading: "A Structured Path for Talent to Grow.",
          intro: "Riptide supports portfolio managers at each stage of development through a clear progression:",
          steps: [
            { _key: key(), _type: "step", title: "Riptide Opportunities Fund", body: "Build an audited track record in an institutional environment with aligned capital." },
            { _key: key(), _type: "step", title: "Riptide Flexible Capital Fund", body: "Starting and strategic capital to help managers launch and grow their strategies." },
            { _key: key(), _type: "step", title: "Custom Managed Accounts", body: "Full operational support plus access to platform capital, SMAs, and external investors." },
          ],
          footnote: "Managers retain ownership of their performance, while growing their long-term business value. Riptide provides coaching and support throughout the process.",
          cta: link("Get started", "/contact") },
        { _type: "explainer", rail: rail("02", "Operating solutions"), label: "Operating solutions", heading: "Institutional Infrastructure Made Easy.",
          body: [block("Exclusive managers on Riptide operate with the systems and support typically reserved for large platforms. Everything you need to run a fund is set-up, from trading execution, portfolio risk analytics, and research systems to legal, financial ops, and fund administration – the Riptide platform is plug and play so you can focus on research and performance from day one.")] },
        { _type: "objectives", tone: "dark", rail: rail("03", "Service providers"), heading: "Service providers",
          rows: [
            ["Execution and OMS", "EZE Software Group"],
            ["Risk analytics", "Arcana"],
            ["Trading", "Riptide Internal and Outsourced Partners"],
            ["Portfolio management and reconciliation", "Cartesian FinOps"],
            ["Prime brokerage", "Goldman Sachs and Pershing"],
            ["Compliance", "Salus GRC"],
            ["Research and data", "Bloomberg, FactSet, InSync Analytics, and proprietary process enhancement and talent development systems."],
            ["Legal, fund administration, and audit", "Cole-Frieman, Ascent Group, and Citrin Cooperman"],
          ].map(([title, body]) => ({ _key: key(), _type: "row", title, body })),
          cta: link("Get started", "/contact") },
        { _type: "objectives", rail: rail("04", "Scaling"), heading: "Scaling investment strategies",
          intro: "We support portfolio managers in transforming strong investment performance into scalable, institutional-ready businesses through disciplined infrastructure, operational oversight, and structured capital pathways.",
          rows: [
            { _key: key(), _type: "row", title: "Institutional Infrastructure", body: "Structured pathways that connect managers with aligned strategic capital partners." },
            { _key: key(), _type: "row", title: "Scalable Platform", body: "Grow your strategy from early stages to institutional scale." },
            { _key: key(), _type: "row", title: "Operational Support", body: "Focus on investing while we take care of day-to-day operations and investor onboarding." },
          ] },
        { _type: "cta", heading: "Get started", body: "Ready to explore how Riptide can support your investment goals? We’re here to help you build, scale, or allocate with clarity and confidence.", link: link("Contact us", "/contact") },
      ],
    },
    {
      _id: "page-for-investors", title: "For Investors", path: "/for-investors",
      seo: seo("FOR INVESTORS | Riptide Advisors", null, og),
      gate: { _type: "reference", _ref: "disclaimer-investors" },
      sections: [
        { _type: "heroPage", eyebrow: "For investors", heading: "For investors",
          intro: "We provide capital partners with differentiated access to high-quality investment strategies, supported by institutional-grade infrastructure and disciplined risk management.",
          image: await image("for-investors-banner.jpg", "Waves breaking on a rocky shore"),
          ctas: [linkItem("Contact now", "/contact")] },
        { _type: "explainer", rail: rail("01", "Multi-manager funds"), label: "Multi-manager funds", heading: "A flexible architecture designed for different investor needs.",
          body: [
            block("Riptide offers a unified investing experience through two multi-manager funds and direct investment:"),
            bullet("Riptide Funds: Opportunities, Flexible Capital, and Direct Investment"),
            bullet("Partner funds and unique actively managed strategies"),
            bullet("Tax-aware strategies designed to offset capital gains and ordinary income"),
            bullet("Self-directed investments with dedicated resources"),
            block("All investments can sit within one account to maintain tax efficiency, simplify reporting, and provide complete transparency into holdings and performance."),
          ],
          ctas: [linkItem("Contact now", "/contact")] },
        { _type: "explainer", rail: rail("02", "Custom managed accounts"), label: "Custom managed accounts", heading: "Access to High-quality Undiscovered Talent.",
          body: [
            block("Riptide provides strategic investors with institutional-grade diligence at the earliest stages of manager development. Investors gain visibility into the risk profile, return characteristics, and investment processes of undiscovered managers before they scale."),
            block("Our platform acts as an outsourced incubator for SMAs into managers and/or special situations originated by our managers:"),
            bullet("Build relationships with managers while their incentives and alignment are strongest"),
            bullet("Participate in advantaged economics through revenue share or GP interests"),
            bullet("Source unique, special investment opportunities"),
            block("This structure helps allocators identify and partner with future high-performing managers at the point of greatest potential impact."),
          ],
          ctas: [linkItem("Contact now", "/contact")] },
      ],
    },
    {
      _id: "page-our-principles", title: "Principles", path: "/our-principles",
      seo: seo("PRINCIPLES | Riptide Advisors", null, og),
      sections: [
        { _type: "heroPage", eyebrow: "Our principles", heading: "Guiding values for our firm",
          intro: "We earn trust from our partners by creating undeniable alignment—building lasting partnerships that empower us to play to win today and improve constantly for tomorrow.",
          ctas: [linkItem("Contact now", "/contact")] },
        { _type: "timeline", rail: rail("01", "Principles"), heading: "Our principles",
          chapters: [
            { _key: key(), _type: "chapter", marker: "01", title: "Earn Trust",
              epigraph: "“The highest form a civilization can reach is a seamless web on deserved trust.”", attribution: "Charlie Munger",
              body: [
                block("We believe trust is the foundation of long-term success. We are committed to treating every individual—partners, team members, and investors—with respect and honesty. Our decisions and actions are guided by a dedication to ethical conduct, open communication, and transparency. We synthesize the objectives of managers, capital partners and the firm to reach optimal outcomes for all parties."),
                block("Importantly, trust is earned over time through consistent communication, transparency and results. We preach patience to our managers and align their success with capital partners who invest over the long term."),
              ] },
            { _key: key(), _type: "chapter", marker: "02", title: "Create Alignment",
              epigraph: "“He whose life has a why can bear almost any how.”", attribution: "Nietzsche",
              body: [
                block("Our management team invests in the business, and all our managers invest in their own strategies. We put our capital at risk because we believe in undeniable alignment with our capital partners. We have created investment mandates that match a diverse set of talent so managers can generate value through strategies that match the goals of our capital partner."),
                block("Our funds align incentives to maximize outcomes. As managers perform, our capital partners invest along the way. We believe managers and capital partners will reinvest in the system as we succeed, creating a positive cycle of future opportunities."),
              ] },
            { _key: key(), _type: "chapter", marker: "03", title: "Build Lasting Partnerships",
              epigraph: "“If you want to go fast, go alone. If you want to go far, go together.”", attribution: "African Proverb",
              body: [
                block("Enduring success is built on strong, mutually beneficial relationships. By fostering open dialogue and consistently delivering on our commitments, we aim to cultivate alliances that stand the test of time."),
                block("Long-term partnerships allow us to:"),
                bullet("Coordinate efficiently and spend less time verifying and more time executing."),
                bullet("Grow exponentially through reputation, referrals, and mutual success."),
                block("Importantly, we want partners that believe in our long-term value, because:"),
                bullet("In hard times: partners lean in and we emerge stronger together."),
                bullet("In good times: partners lean in and amplify our success."),
                block("Lasting partnerships build durable systems of reciprocity, loyalty, and trust offering stability for all stakeholders."),
              ] },
            { _key: key(), _type: "chapter", marker: "04", title: "Play to Win",
              epigraph: "“The credit belongs to the man who is actually in the arena.”", attribution: "Theodore Roosevelt",
              body: [
                block("Our team approaches every challenge with determination, ambition, and a focus on excellence. \"Play to win\" means setting clear goals and holding ourselves accountable for results. We embrace calculated risks, think creatively, and pursue competitive advantages that drive superior outcomes for our investors and our firm. While we compete vigorously, we do so with integrity and respect for the rules of the game."),
                block("Playing to win is a posture of radical responsibility, highlighted by our belief that all managers should invest personally alongside the firm’s capital partners."),
                block("Our managers enter the arena, own their decisions, absorb consequences, and learn from their mistakes. Importantly, winning is not the only reward, becoming someone capable of winning over the long-term is the true objective."),
              ] },
            { _key: key(), _type: "chapter", marker: "05", title: "Improve Constantly",
              epigraph: "“If you want to get somewhere else, you must run at least twice as fast as that.”", attribution: "Lewis Carroll",
              body: [
                block("We are committed to innovating, adapting, and growing in all aspects of our business. By regularly evaluating our performance, seeking feedback, and investing in our talent, we ensure that our strategies, processes, and services remain cutting-edge and effective."),
                block("In competitive markets, the forces around you are constantly improving. Standing still is equivalent to falling behind."),
                block("We move with speed and precision to achieve small gains every day that compound into large competitive advantages over time."),
              ] },
          ] },
        { _type: "cta", heading: "Contact now", body: "Ready to explore how Riptide can support your investment goals? We’re here to help you build, scale, or allocate with clarity and confidence.", link: link("Contact us", "/contact") },
      ],
    },
    {
      _id: "page-risk", title: "Risk", path: "/risk",
      seo: seo("RISK | Riptide Advisors", null, og),
      sections: [{ _type: "toolEmbed", tool: "leverage-calculator", heading: "Maximum Leverage Calculator" }],
    },
    {
      _id: "page-contact", title: "Contact Us", path: "/contact",
      seo: seo("CONTACT US | Riptide Advisors", null, og),
      sections: [
        { _type: "formsSection", heading: "Contact us",
          forms: [
            { _key: key(), _type: "formRef", title: "Portfolio managers", key: "portfolio-manager", successMessage: "Thanks for submitting!" },
            { _key: key(), _type: "formRef", title: "Investors", key: "allocator", successMessage: "Thanks for submitting!" },
          ] },
        { _type: "contactBlock", showEmail: true, showLocation: true },
      ],
    },
    {
      _id: "page-about", title: "About", path: "/about",
      seo: seo("About | Riptide Advisors", null, og),
      sections: [
        { _type: "heroPage", heading: "About Riptide",
          intro: "Riptide Advisors is an investment firm focused on delivering consistent, high-quality returns through a transparent, talent-driven approach. Our platform connects talented investment professionals with the resources, support, and flexibility necessary to build and manage their own businesses. By fostering a collaborative and accountable environment, we aim to align the interests of our investment teams with Riptide’s various stakeholders, creating meaningful opportunities for growth and strong investment outcomes for our capital partners.",
          ctas: [linkItem("Discover Services", "/services")] },
      ],
    },
    {
      _id: "page-services", title: "Services", path: "/services",
      seo: seo("Services | Riptide Advisors", null, og),
      sections: [
        { _type: "explainer", heading: "How We Serve" },
        { _type: "explainer", rail: rail("01", "Investment managers"), heading: "Investment Managers",
          body: [block("We offer emerging and established investment talent a supportive platform to build verifiable, portable track records, backed by robust business formation support and access to diversified capital. Our scalable infrastructure features AI-driven research and integrated risk management tools, enabling managers to focus on their investment process. We seek individuals who value a balance of autonomy and partnership that is elusive in more traditional alternatives, while aligning success across all Riptide stakeholders. Rather than impose a rigid one-size-fits-all framework, we empower our managers with the resources and flexibility needed to maximize their potential.")] },
        { _type: "explainer", rail: rail("02", "Capital partners"), heading: "Capital Partners",
          body: [block("We create alignment in our strategies through direct management investment. We match this alignment with high-performance coaching and cutting-edge systems to optimize risk-adjusted returns. Our strategic partners gain access to talent and all our LPs invest alongside motivated managers at peak performance. We design our investment products to align the right talent with the right capital partner objectives to maximize outcomes for managers, capital partners and the firm.")],
          ctas: [linkItem("Contact Us", "/contact")] },
      ],
    },
  ];

  // Privacy policy: verbatim Wix text, imported as a DRAFT only (it is template placeholder copy).
  const privacy = {
    _id: "drafts.page-english-privacy-policy", _type: "page", title: "Privacy Policy", path: "/english-privacy-policy",
    seo: seo("Privacy Policy | Riptide Advisors", "Riptide Advisors is a hedge fund platform serving emerging managers via SMA and LP investments.", og),
    review: { status: "changes_requested", note: "BLOCKED: the Wix page is Wix's placeholder template, not a privacy policy. Replace with the policy supplied by compliance (verbatim)." },
    sections: [{
      _key: key(), _type: "legalText", heading: "Privacy Policy", source: "Wix page /english-privacy-policy as of 2026-10-17 (template placeholder text)",
      body: [
        block("A legal disclaimer", "h2"),
        block("The explanations and information provided on this page are only general and high-level explanations and information on how to write your own document of a Privacy Policy. You should not rely on this article as legal advice or as recommendations regarding what you should actually do, because we cannot know in advance what are the specific privacy policies you wish to establish between your business and your customers and visitors. We recommend that you seek legal advice to help you understand and to assist you in the creation of your own Privacy Policy."),
        block("Privacy Policy - the basics", "h2"),
        block("Having said that, a privacy policy is a statement that discloses some or all of the ways a website collects, uses, discloses, processes, and manages the data of its visitors and customers. It usually also includes a statement regarding the website’s commitment to protecting its visitors’ or customers’ privacy, and an explanation about the different mechanisms the website is implementing in order to protect privacy."),
        block("Different jurisdictions have different legal obligations of what must be included in a Privacy Policy. You are responsible to make sure you are following the relevant legislation to your activities and location."),
        block("What to include in the Privacy Policy", "h2"),
        block("Generally speaking, a Privacy Policy often addresses these types of issues: the types of information the website is collecting and the manner in which it collects the data; an explanation about why is the website collecting these types of information; what are the website’s practices on sharing the information with third parties; ways in which your visitors and customers can exercise their rights according to the relevant privacy legislation; the specific practices regarding minors’ data collection; and much, much more."),
        linkBlock("To learn more about this, check out our article “", "Creating a Privacy Policy", "https://support.wix.com/en/article/creating-a-privacy-policy", "”."),
      ],
    }],
  };

  const withKeys = (p) => ({ _type: "page", ...p, sections: p.sections.map((s) => ({ _key: s._key ?? key(), ...s })) });
  const published = [...team, ...disclaimers, settings, ...pages.map(withKeys)].map((d) => ({ ...d, review: { _type: "review", status: "editing" } }));
  return { published, drafts: [privacy] };
}

const stableHash = (doc) => createHash("sha256").update(JSON.stringify(doc)).digest("hex").slice(0, 16);

const { published, drafts } = await build();
if (DRY) {
  console.log(JSON.stringify({ published, drafts }, null, 2));
  process.exit(0);
}

const now = new Date().toISOString();
const tx = client.transaction();
for (const doc of [...published, ...drafts]) tx.createOrReplace(doc);
for (const doc of published) {
  tx.createOrReplace({
    _id: `publishRecord-migration-${doc._id}`,
    _type: "publishRecord",
    documentId: doc._id,
    documentType: doc._type,
    documentTitle: doc.title ?? doc.name ?? doc.siteName ?? doc._id,
    action: "publish",
    publishedAt: now,
    publishedBy: "Content import (Phase 2 migration from Wix)",
    approvedBy: "Migration baseline: copy exported verbatim from riptide-advisors.com (see migration/)",
    contentHash: stableHash(doc),
    snapshot: JSON.stringify(doc, null, 2),
  });
}
const res = await tx.commit();
console.log(`✔ Imported ${published.length} published + ${drafts.length} draft documents (${res.results.length} mutations).`);
