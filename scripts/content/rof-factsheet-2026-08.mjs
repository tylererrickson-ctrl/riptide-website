#!/usr/bin/env node
/**
 * Creates/updates the Riptide Opportunities Fund performance page (/rof) from
 * "Riptide_Opportunities_Fund_Factsheet_August_2026.pdf" (supplied by Tyler, 2026-10-17).
 * All text is verbatim from the factsheet; all figures are as printed (none recomputed).
 * Exception (Tyler, 2026-10-17): prime brokers updated to "Clear Street, Goldman Sachs".
 *   node --env-file=.env.local scripts/content/rof-factsheet-2026-08.mjs
 * Future monthly updates: edit the page in the Studio (review → approve → publish).
 */
import { createClient } from "@sanity/client";

const c = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2026-10-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

let k = 0;
const key = () => `rof${(++k).toString(36).padStart(4, "0")}`;
const span = (text, marks = []) => ({ _type: "span", _key: key(), text, marks });
const block = (text) => ({ _type: "block", _key: key(), style: "normal", markDefs: [], children: [span(text)] });
const leadBlock = (lead, rest) => ({ _type: "block", _key: key(), style: "normal", markDefs: [], children: [span(lead, ["strong"]), span(rest)] });
const rail = (number, label, caption) => ({ _type: "rail", number, label, ...(caption ? { caption } : {}) });
const fact = (label, value, emphasis = false) => ({ _key: key(), _type: "fact", label, value, ...(emphasis ? { emphasis } : {}) });
const row = (cells, total = false) => ({ _key: key(), _type: "tableRow", cells, ...(total ? { total } : {}) });

const sections = [
  {
    _type: "heroPage",
    eyebrow: "Multi-manager strategy · Factsheet: August 2026 · For qualified purchasers only",
    heading: "Riptide Opportunities Fund",
    intro:
      "The Riptide Opportunities Fund is a multi-manager platform built around an aligned capital philosophy. Portfolio managers contribute a first-loss capital buffer, while Opportunities Fund investors hold capital that sits senior to that buffer in the loss waterfall. The result is a structure where every participant (platform, manager, and allocator) shares a common incentive to generate strong, risk-adjusted performance.",
    stats: [
      { _key: key(), _type: "stat", label: "Inception", value: "Jan 2026" },
      { _key: key(), _type: "stat", label: "Strategy AUM", value: "~$60M" },
      { _key: key(), _type: "stat", label: "Fidelity CUSIP", value: "76799E955" },
      { _key: key(), _type: "stat", label: "Pershing CUSIP", value: "757LP0010" },
    ],
    ctas: [{ _key: key(), _type: "link", label: "Contact us", href: "/contact" }],
  },
  {
    _type: "keyFacts",
    rail: rail("01", "Performance characteristics", "As of 31-Aug-2026"),
    heading: "Performance Characteristics",
    facts: [
      fact("2026 YTD net return", "+7.17%", true),
      fact("Annualized Return", "10.9%", true),
      fact("Annualized Volatility", "3.1%", true),
      fact("Sharpe Ratio", "3.5x", true),
      fact("Best Month", "+2.61%"),
      fact("Worst Month", "+0.02%"),
      fact("Positive Months", "8 / 8"),
      fact("Max Drawdown", "N/A"),
      fact("Beta vs SPX", "0.1"),
      fact("Inception", "Jan 2026"),
    ],
    note: "Returns are estimated, net of all fees and expenses, and unaudited.",
  },
  {
    _type: "fundPerformance",
    rail: rail("02", "Performance"),
    heading: "Growth of $1,000 (2026 YTD)",
    intro: "Riptide Opportunities Fund vs. SPX Index (Total Return)",
    fundLabel: "ROF",
    benchmarkLabel: "SPX Index TR",
    asOf: "2026-08-31",
    years: [
      {
        _key: key(),
        _type: "perfYear",
        year: 2026,
        fund: [0.02, 0.07, 1.49, 1.4, 2.61, 0.42, 0.55, 0.43],
        benchmark: [1.45, -0.76, -4.98, 10.49, 5.26, -0.95, -0.06, 2.72],
        fundYtd: 7.17,
        benchmarkYtd: 13.13,
      },
    ],
    footnote: "* Returns are estimated, net of all fees and expenses, and unaudited. SPX Index TR (total return) data sourced from Bloomberg.",
  },
  {
    _type: "explainer",
    rail: rail("03", "Commentary", "August 2026"),
    heading: "August 2026 Commentary",
    body: [
      block(
        "The Riptide Opportunities Fund generated a +0.43% net return in August, an eighth consecutive positive month, while the SPX Index (total return) gained +2.72%. All five sub-strategies contributed positively — the first month this year in which every bucket added. Tactical led at +0.21% (50% of the month’s return), followed by Fundamental L/S at +0.13% (31%), Macro at +0.06% (13%), Systematic at +0.02% (5%) and Market Neutral at +0.01% (1%).",
      ),
      block(
        "The breadth is the notable feature. Where prior months leaned on two or three buckets, August’s gain was spread across the full roster with every strategy above water. Realized volatility eased to 3.1% across eight months and the Sharpe stands at 3.5x, down from 3.6x as the return pace moderated. The Fund trailed a strong equity tape — the SPX’s +2.72% was its best month since May — which is the expected outcome given a beta of 0.1 and the low-correlation profile the platform is built to deliver.",
      ),
      block(
        "On an annualized basis, the Fund has returned 10.94% over its first eight months. Because capital was still ramping and held largely in cash during January and February, the period since March remains more representative of the platform at scale: over the six months from March through August, the Fund has annualized 14.67%.",
      ),
    ],
  },
  {
    _type: "barList",
    rail: rail("04", "Attribution"),
    heading: "August Strategy Drivers",
    intro: "Contribution estimates below sum to the Fund’s reported monthly net return.",
    unit: "%",
    signed: true,
    bars: [
      { _key: key(), _type: "bar", label: "Tactical", value: 0.21, note: "Largest driver — 50% of the month’s return." },
      { _key: key(), _type: "bar", label: "Fundamental L/S", value: 0.13, note: "Second contributor — 31% of return." },
      { _key: key(), _type: "bar", label: "Macro", value: 0.06, note: "Contributor — 13% of return." },
      { _key: key(), _type: "bar", label: "Systematic", value: 0.02, note: "Modest contributor — 5% of return." },
      { _key: key(), _type: "bar", label: "Market Neutral", value: 0.01, note: "Modest contributor — 1% of return." },
    ],
  },
  {
    _type: "dataTable",
    rail: rail("05", "Exposure"),
    heading: "Exposure by Strategy",
    columns: ["Strategy", "Allocation (% GMV)", "# on Platform"],
    rows: [
      row(["Systematic", "62%", "3"]),
      row(["Fundamental L/S", "28%", "7"]),
      row(["Market Neutral", "5%", "1"]),
      row(["Tactical", "3%", "1"]),
      row(["Macro", "2%", "1"]),
      row(["Total", "100%", "13"], true),
    ],
  },
  {
    _type: "explainer",
    label: "Diversification Notes",
    heading: "Diversification Notes",
    body: [
      block("The Fund is allocated across five uncorrelated strategy buckets spanning thirteen portfolio managers, with risk attribution diversified to minimize correlation and drawdown."),
      block("Single-manager allocation capped at 25% of NAV. Target net exposure: −20% to +30%. Daily VaR (95%): ≤1.5% of NAV."),
      block("Portfolio managers co-invest alongside Riptide’s first-loss capital, ensuring meaningful downside skin-in-the-game across the platform."),
    ],
  },
  {
    _type: "dataTable",
    rail: rail("06", "Risk"),
    heading: "Portfolio Construction Guardrails",
    columns: ["Parameter", "Limit"],
    rows: [
      row(["Max Single-Manager Allocation", "25% of NAV"]),
      row(["Max Single-Name Position", "5% of Gross"]),
      row(["Max Investment Account Gross Leverage", "5–10x (based on Daily VaR)"]),
      row(["Target Net Exposure", "−20% to +30%"]),
      row(["Manager-Level Stop-Loss", "60–70% of Equity"]),
      row(["Liquidity (≤5-day)", "≥95% of NAV"]),
      row(["Daily Portfolio VaR (95%)", "≤1.5% of NAV"]),
    ],
  },
  {
    _type: "explainer",
    rail: rail("07", "Strategy"),
    label: "Strategy",
    heading: "Strategy",
    body: [
      block(
        "The platform offers institutional-grade operational infrastructure including execution management (Eze Castle), risk management (Arcana), compliance (Salus GRC), prime brokerage (Clear Street, Goldman Sachs), and middle/back office (Cartesian FinOps). Portfolio managers benefit from this turnkey support while maintaining full investment autonomy. By removing the operational burden of launching and running a fund, the platform enables talented portfolio managers to focus exclusively on generating alpha.",
      ),
      block(
        "The fund allocates across macro, systematic, fundamental long/short, market neutral, and tactical equity strategies. Risk attribution is diversified across strategy types to minimize correlation and drawdown risk. At the fund level, Riptide enforces strict portfolio construction guardrails (including position limits, leverage caps, stop-losses, and daily risk monitoring) designed to protect investor capital across all market environments. The Riptide Opportunities Fund is now live on the NFS/Fidelity platform for subscriptions.",
      ),
    ],
  },
  {
    _type: "keyFacts",
    rail: rail("08", "Terms"),
    heading: "Fund Information",
    facts: [
      fact("Inception", "Jan 2026"),
      fact("Min Invest.", "$1.0M"),
      fact("Structure / Domicile", "Delaware Series LLC"),
      fact("Subscription", "Monthly"),
      fact("Strategy AUM", "~$60M"),
      fact("Redemption", "Quarterly"),
      fact("Currency", "USD"),
      fact("Prime Broker", "Clear Street, Goldman Sachs"),
      fact("Mgmt Fee", "Pass-Thru"),
      fact("Fund Admin", "Ascent Group"),
      fact("Incentive Fee", "20%"),
      fact("Mid/Back Office", "Cartesian FinOps"),
      fact("High-Water Mark", "Yes"),
      fact("Legal", "Cole-Frieman & Mallon"),
      fact("Auditor", "Citrin Cooperman"),
      fact("Compliance", "Salus GRC"),
    ],
  },
  {
    _type: "legalText",
    rail: rail("09", "Disclosures"),
    heading: "Important Disclosures",
    source: "Riptide_Opportunities_Fund_Factsheet_August_2026.pdf, page 2 (verbatim)",
    body: [
      leadBlock(
        "Informational Purposes Only. ",
        "This document does not constitute an offer to sell or a solicitation of an offer to buy any securities. Past performance is not indicative of future results. All returns are estimated, unaudited, and subject to change. Investments in the Fund involve significant risks including loss of the entire investment. The Fund is only available to qualified purchasers as defined under the Investment Company Act of 1940.",
      ),
      leadBlock(
        "Confidentiality. ",
        "The information contained herein is confidential and proprietary to Riptide Advisors LLC and may not be reproduced or distributed without prior written consent. Any projections, forecasts, or estimates are forward-looking statements based upon certain assumptions.",
      ),
      leadBlock(
        "Registration. ",
        "Riptide Advisors LLC is an Exempt Reporting Adviser (ERA) under the Investment Advisers Act of 1940. As an ERA, the firm files Form ADV with the SEC. ERA status does not imply a certain level of skill or training. Additional information is available in its Form ADV upon request.",
      ),
    ],
  },
];

const doc = {
  _id: "page-rof",
  _type: "page",
  title: "Riptide Opportunities Fund",
  path: "/rof",
  seo: {
    _type: "seo",
    title: "Riptide Opportunities Fund | Riptide Advisors",
    description: "Riptide Opportunities Fund factsheet (qualified purchasers only).",
    noindex: true,
  },
  gate: { _type: "reference", _ref: "disclaimer-investors" },
  sections: sections.map((s) => ({ _key: key(), ...s })),
  review: { _type: "review", status: "editing" },
};

if (await c.getDocument("drafts.page-rof")) throw new Error("A Studio draft of /rof exists; edit it in the Studio instead.");
await c
  .transaction()
  .createOrReplace(doc)
  .create({
    _type: "publishRecord",
    documentId: doc._id,
    documentType: "page",
    documentTitle: doc.title,
    action: "publish",
    publishedAt: new Date().toISOString(),
    publishedBy: "Tyler Errickson (factsheet supplied in chat; applied via API by Claude)",
    approvedBy: "Tyler Errickson (direct instruction)",
    reviewNote: "Created /rof performance page from the August 2026 factsheet. Gated by the Qualified Purchaser notice; noindex.",
    snapshot: JSON.stringify(doc, null, 2),
  })
  .commit();
console.log(`Published ${doc.path} with ${doc.sections.length} sections`);
