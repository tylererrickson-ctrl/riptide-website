import "server-only";
import type { FormKey, Submission } from "./forms";

/**
 * Writes website leads into Notion (server only; the key never reaches the browser).
 *  - Portfolio Manager form → existing "PM Pipeline" database (Lead Source = Intake Form)
 *  - Allocator form         → "Website Inquiries — Investors" database
 * Mapping decisions: migration/forms.md
 */

const NOTION_VERSION = "2025-09-03";

/** Existing PM Pipeline options we may set. We never create new select options in the team's pipeline. */
const PM_PRIME_BROKERS = ["OPCO", "IB", "Clear Street", "IBKR", "StoneX"];

const text = (s: string) => {
  // Notion rich_text items are capped at 2000 characters.
  const out: { type: "text"; text: { content: string } }[] = [];
  for (let i = 0; i < s.length; i += 1900) out.push({ type: "text", text: { content: s.slice(i, i + 1900) } });
  return out.length ? out : [{ type: "text" as const, text: { content: "" } }];
};
const title = (s: string) => ({ title: text(s) });
const rich = (s: string) => ({ rich_text: text(s) });
const multi = (vals: string[]) => ({ multi_select: vals.map((name) => ({ name })) });
const select = (name: string) => ({ select: { name } });
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v.join(", ") : (v ?? ""));

/** Best-effort parse of free-text AUM ("$25m", "1.2bn", "40 million", "250,000,000"). Returns null when unsure. */
export function parseAmount(input: string): number | null {
  const s = input.toLowerCase().replace(/[$,\s]/g, "").replace(/usd/g, "");
  const m = s.match(/^(\d+(?:\.\d+)?)(k|thousand|m|mm|mn|mil|million|b|bn|billion)?$/);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2] ?? "";
  const mult = /^(k|thousand)$/.test(unit) ? 1e3 : /^(m|mm|mn|mil|million)$/.test(unit) ? 1e6 : /^(b|bn|billion)$/.test(unit) ? 1e9 : 1;
  const v = n * mult;
  return Number.isFinite(v) && v > 0 ? v : null;
}

function pmProperties(v: Submission, submittedAt: string) {
  const name = `${str(v.firstname)} ${str(v.lastname)}`.trim();
  const roles = (v.current_role as string[]) ?? [];
  const pbRaw = str(v.current_prime_broker);
  const pb = PM_PRIME_BROKERS.find((o) => o.toLowerCase() === pbRaw.toLowerCase());
  const aumRaw = str(v.peak_aum_risk_capital);
  const aum = parseAmount(aumRaw);
  const notes = [
    `Website form submission (${submittedAt.slice(0, 10)})`,
    `Current role: ${roles.join(", ")}`,
    `Peak AUM/Risk Capital: ${aumRaw}`,
    `Current prime broker: ${pbRaw}`,
    `Stock/Investment idea: ${str(v.investment_idea)}`,
  ].join("\n");
  return {
    "Firm Name": title(name),
    "Contact Name": rich(name),
    Email: { email: str(v.email) },
    Strategy: multi(v.strategy as string[]),
    ...(roles.includes("Running Fund") ? { "Current Role": select("Running Fund") } : {}),
    ...(pb ? { "Prime Broker(s)": select(pb) } : {}),
    ...(aum ? { AUM: { number: aum } } : {}),
    "Strategy Description": rich(str(v.strategy_description)),
    "How can Riptide help you?": rich(str(v.how_can_riptide_help)),
    "Lead Source": select("Intake Form"),
    Status: { status: { name: "Intro Stage: TE" } }, // first pipeline stage (Tyler, 2026-10-17)
    Date: { date: { start: submittedAt.slice(0, 10) } },
    Notes: rich(notes),
  };
}

function allocatorProperties(v: Submission) {
  return {
    Name: title(`${str(v.firstname)} ${str(v.lastname)}`.trim()),
    Email: { email: str(v.email) },
    "Allocator Type": multi(v.allocator_type as string[]),
    Title: multi(v.title as string[]),
    Mandate: multi(v.mandate as string[]),
    "Investment Size": rich(str(v.investment_size)),
    "How can Riptide help you?": rich(str(v.how_can_riptide_help)),
    "Lead Source": select("Website form"),
    Status: { status: { name: "New" } },
  };
}

export class NotionNotConfigured extends Error {}

export async function createLead(form: FormKey, values: Submission): Promise<{ id: string }> {
  const key = process.env.NOTION_API_KEY;
  const dataSourceId = form === "portfolio-manager" ? process.env.NOTION_PM_DATA_SOURCE_ID : process.env.NOTION_INVESTOR_DATA_SOURCE_ID;
  if (!key || !dataSourceId) throw new NotionNotConfigured("Notion is not configured");

  const submittedAt = new Date().toISOString();
  const properties = form === "portfolio-manager" ? pmProperties(values, submittedAt) : allocatorProperties(values);

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parent: { type: "data_source_id", data_source_id: dataSourceId }, properties }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Notion ${res.status}: ${body.slice(0, 300)}`);
  }
  const page = (await res.json()) as { id: string };
  return { id: page.id };
}
