"use client";

import { useId, useState } from "react";

/**
 * Field definitions mirror the Wix forms exactly (migration/site-inventory.md §5).
 * Phase 2: renders and validates only. Phase 4 wires submission to HubSpot.
 */
type Field =
  | { name: string; label: string; kind: "text" | "email"; required: true }
  | { name: string; label: string; kind: "textarea"; required: true }
  | { name: string; label: string; kind: "checkboxes"; options: string[]; required: true };

export const FORM_FIELDS: Record<"portfolio-manager" | "allocator", Field[]> = {
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
    { name: "investment_idea", label: "Stock/Investment Idea", kind: "text", required: true },
    { name: "strategy_description", label: "Strategy Description", kind: "textarea", required: true },
    { name: "how_can_riptide_help", label: "How can Riptide help you?", kind: "textarea", required: true },
  ],
  allocator: [
    { name: "firstname", label: "First Name", kind: "text", required: true },
    { name: "lastname", label: "Last Name", kind: "text", required: true },
    { name: "email", label: "Email", kind: "email", required: true },
    { name: "allocator_type", label: "Allocator Type", kind: "checkboxes", required: true,
      options: ["Institutional", "RIA", "Family Office", "HNW/Individual", "Other"] },
    { name: "title", label: "Title", kind: "checkboxes", required: true,
      options: ["CEO", "CIO", "Analyst", "Wealth Owner/Individual", "Other"] },
    { name: "mandate", label: "Mandate", kind: "checkboxes", required: true,
      options: ["Multi-Strategy Funds", "Hedge Funds (Direct)", "Special Situations", "Other"] },
    { name: "investment_size", label: "Investment Size", kind: "text", required: true },
    { name: "how_can_riptide_help", label: "How can Riptide help you?", kind: "textarea", required: true },
  ],
};

type FormRef = { _key: string; title: string; key: "portfolio-manager" | "allocator"; successMessage?: string };

export function ContactForms({ forms }: { forms: FormRef[] }) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  if (!forms.length) return null;
  return (
    <div className="contact-forms">
      {forms.length > 1 && (
        <div role="tablist" aria-label="Who are you?" className="form-tabs">
          {forms.map((f, i) => (
            <button
              key={f._key}
              role="tab"
              id={`${baseId}-tab-${i}`}
              aria-selected={i === active}
              aria-controls={`${baseId}-panel-${i}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  const n = (active + (e.key === "ArrowRight" ? 1 : forms.length - 1)) % forms.length;
                  setActive(n);
                  document.getElementById(`${baseId}-tab-${n}`)?.focus();
                }
              }}
            >
              {f.title}
            </button>
          ))}
        </div>
      )}
      {forms.map((f, i) => (
        <div
          key={f._key}
          role={forms.length > 1 ? "tabpanel" : undefined}
          id={`${baseId}-panel-${i}`}
          aria-labelledby={forms.length > 1 ? `${baseId}-tab-${i}` : undefined}
          hidden={i !== active}
        >
          <LeadForm formKey={f.key} title={f.title} successMessage={f.successMessage} />
        </div>
      ))}
    </div>
  );
}

function LeadForm({ formKey, title, successMessage }: { formKey: FormRef["key"]; title: string; successMessage?: string }) {
  const id = useId();
  const [status, setStatus] = useState<"idle" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    for (const fs of form.querySelectorAll<HTMLFieldSetElement>("fieldset[data-required]")) {
      if (!fs.querySelector("input:checked")) {
        setError(`Please choose at least one option for “${fs.dataset.label}”.`);
        fs.querySelector("input")?.focus();
        return;
      }
    }
    setError(null);
    // Phase 4: POST to HubSpot Forms API. Until then nothing is sent anywhere.
    setStatus("error");
    setError("This form isn't connected yet (staging). Please email info@riptide-advisors.com.");
  };

  if (status === "done") return <p role="status">{successMessage ?? "Thanks for submitting!"}</p>;

  return (
    <form onSubmit={onSubmit} aria-label={title} noValidate={false}>
      {FORM_FIELDS[formKey].map((f) => {
        const fid = `${id}-${f.name}`;
        if (f.kind === "checkboxes") {
          return (
            <fieldset key={f.name} data-required data-label={f.label}>
              <legend>
                {f.label} <span aria-hidden="true">*</span>
                <span className="sr-only"> (required, choose at least one)</span>
              </legend>
              {f.options.map((o) => (
                <label key={o}>
                  <input type="checkbox" name={f.name} value={o} /> {o}
                </label>
              ))}
            </fieldset>
          );
        }
        return (
          <div className="field" key={f.name}>
            <label htmlFor={fid}>
              {f.label} <span aria-hidden="true">*</span>
            </label>
            {f.kind === "textarea" ? (
              <textarea id={fid} name={f.name} required rows={5} />
            ) : (
              <input
                id={fid}
                name={f.name}
                type={f.kind}
                required
                autoComplete={f.name === "firstname" ? "given-name" : f.name === "lastname" ? "family-name" : f.kind === "email" ? "email" : undefined}
              />
            )}
          </div>
        );
      })}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button type="submit" className="button-solid">
        Submit
      </button>
    </form>
  );
}
