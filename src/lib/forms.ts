/**
 * Lead form definitions, shared by the browser (rendering) and the server (validation).
 * Fields mirror the Wix forms exactly (migration/site-inventory.md §5).
 */

export type FormKey = "portfolio-manager" | "allocator" | "mailing-list";

export const FORM_KEYS: readonly FormKey[] = ["portfolio-manager", "allocator", "mailing-list"];

/** Shown under the mailing-list form and stored with each sign-up as the record of consent. */
export const MAILING_LIST_CONSENT =
  "By subscribing, you agree to receive occasional emails from Riptide Advisors. You can unsubscribe at any time. See our Privacy Policy for how we handle your information.";

export type Field =
  | { name: string; label: string; kind: "text" | "email"; required: boolean }
  | { name: string; label: string; kind: "textarea"; required: boolean }
  | { name: string; label: string; kind: "checkboxes"; options: readonly string[]; required: boolean };

// Required fields show an asterisk. PM form: idea / description / "how can we help" optional;
// allocator form: everything optional (Tyler, 2026-10-20).
export const FORM_FIELDS: Record<FormKey, readonly Field[]> = {
  "portfolio-manager": [
    { name: "firstname", label: "First Name", kind: "text", required: true },
    { name: "lastname", label: "Last Name", kind: "text", required: true },
    { name: "email", label: "Email", kind: "email", required: true },
    { name: "strategy", label: "Strategy", kind: "checkboxes", required: true,
      options: ["Fundamental L/S", "Systematic", "Tactical", "Macro", "Other"] },
    { name: "current_role", label: "Current Role", kind: "checkboxes", required: true,
      options: ["Employed (Buy-Side)", "Employed (Sell-Side)", "Running PA", "Running Fund", "Other"] },
    { name: "peak_aum_risk_capital", label: "Peak AUM/Risk Capital", kind: "text", required: true },
    { name: "current_prime_broker", label: "Current Prime Broker", kind: "text", required: true },
    { name: "investment_idea", label: "Stock/Investment Idea", kind: "text", required: false },
    { name: "strategy_description", label: "Strategy Description", kind: "textarea", required: false },
    { name: "how_can_riptide_help", label: "How can Riptide help you?", kind: "textarea", required: false },
  ],
  allocator: [
    { name: "firstname", label: "First Name", kind: "text", required: false },
    { name: "lastname", label: "Last Name", kind: "text", required: false },
    { name: "email", label: "Email", kind: "email", required: false },
    { name: "allocator_type", label: "Allocator Type", kind: "checkboxes", required: false,
      options: ["Institutional", "RIA", "Family Office", "HNW/Individual", "Other"] },
    { name: "title", label: "Title", kind: "checkboxes", required: false,
      options: ["CEO", "CIO", "Analyst", "Wealth Owner/Individual", "Other"] },
    { name: "mandate", label: "Mandate", kind: "checkboxes", required: false,
      options: ["Multi-Strategy Funds", "Hedge Funds (Direct)", "Special Situations", "Other"] },
    { name: "investment_size", label: "Investment Size", kind: "text", required: false },
    { name: "how_can_riptide_help", label: "How can Riptide help you?", kind: "textarea", required: false },
  ],
  "mailing-list": [
    { name: "firstname", label: "First Name", kind: "text", required: true },
    { name: "lastname", label: "Last Name", kind: "text", required: true },
    { name: "email", label: "Email", kind: "email", required: true },
    { name: "audience", label: "I am", kind: "checkboxes", required: true,
      options: ["Investor", "Portfolio Manager", "Other"] },
  ],
};

export type Submission = Record<string, string | string[]>;

const MAX = { text: 300, email: 254, textarea: 5000 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Validates and normalises a submission. Returns clean values or a list of problems. */
export function validate(form: FormKey, raw: unknown): { ok: true; values: Submission } | { ok: false; errors: string[] } {
  if (!raw || typeof raw !== "object") return { ok: false, errors: ["Invalid submission"] };
  const input = raw as Record<string, unknown>;
  const values: Submission = {};
  const errors: string[] = [];
  let filled = false;
  for (const f of FORM_FIELDS[form]) {
    const v = input[f.name];
    if (f.kind === "checkboxes") {
      const arr = (Array.isArray(v) ? v : v == null ? [] : [v]).map(String);
      const picked = f.options.filter((o) => arr.includes(o));
      if (picked.length !== arr.length) errors.push(`${f.label}: unknown option`);
      if (f.required && !picked.length) errors.push(`${f.label}: choose at least one`);
      values[f.name] = picked;
      if (picked.length) filled = true;
    } else {
      const s = typeof v === "string" ? v.trim() : "";
      if (!s) {
        if (f.required) errors.push(`${f.label} is required`);
      } else if (s.length > MAX[f.kind]) errors.push(`${f.label} is too long`);
      else if (f.kind === "email" && !EMAIL_RE.test(s)) errors.push("Please enter a valid email address");
      values[f.name] = s;
      if (s) filled = true;
    }
  }
  // A form with no required fields still shouldn't create a blank lead.
  if (!filled && !errors.length) errors.push("Please fill in at least one field");
  return errors.length ? { ok: false, errors } : { ok: true, values };
}
