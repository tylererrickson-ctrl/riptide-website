"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SmartLink } from "./SmartLink";
import { FORM_FIELDS, MAILING_LIST_CONSENT, type FormKey } from "@/lib/forms";

/**
 * Contact forms. Fields mirror the Wix forms exactly (src/lib/forms.ts).
 * Submissions POST to /api/lead, which writes them into Notion (see migration/forms.md).
 */

type FormRef = { _key: string; title: string; key: FormKey; successMessage?: string };

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
              type="button"
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

function collect(form: HTMLFormElement, formKey: FormKey) {
  const fd = new FormData(form);
  const values: Record<string, string | string[]> = {};
  for (const f of FORM_FIELDS[formKey]) {
    values[f.name] = f.kind === "checkboxes" ? fd.getAll(f.name).map(String) : String(fd.get(f.name) ?? "");
  }
  return { values, hp: String(fd.get("website") ?? "") };
}

function LeadForm({ formKey, title, successMessage }: { formKey: FormKey; title: string; successMessage?: string }) {
  const id = useId();
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const startedAt = useRef(0);
  const doneRef = useRef<HTMLParagraphElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  useEffect(() => {
    if (status === "done") doneRef.current?.focus();
  }, [status]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    setStatus("sending");
    try {
      const { values, hp } = collect(form, formKey);
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ form: formKey, values, hp, startedAt: startedAt.current }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong. Please email info@riptide-advisors.com.");
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong. Please email info@riptide-advisors.com.");
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  };

  if (status === "done") {
    return (
      <p ref={doneRef} role="status" tabIndex={-1} className="lead">
        {successMessage ?? "Thanks for submitting!"}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} aria-label={title} className="lead-form" aria-busy={status === "sending"}>
      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {FORM_FIELDS[formKey].map((f) => {
        const fid = `${id}-${f.name}`;
        if (f.kind === "checkboxes") {
          return (
            <fieldset key={f.name} data-required={f.required || undefined} data-label={f.label} className="span-2">
              <legend>
                {f.label}
                {f.required && <span aria-hidden="true"> *</span>}
                {f.required && <span className="sr-only"> (required, choose at least one)</span>}
              </legend>
              <div className="checks">
                {f.options.map((o) => (
                  <label key={o} className="check">
                    <input type="checkbox" name={f.name} value={o} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          );
        }
        return (
          <div className={`field${f.kind === "textarea" ? " span-2" : ""}`} key={f.name}>
            <label htmlFor={fid}>
              {f.label}
              {f.required && <span aria-hidden="true"> *</span>}
            </label>
            {f.kind === "textarea" ? (
              <textarea id={fid} name={f.name} required={f.required} rows={5} maxLength={5000} />
            ) : (
              <input
                id={fid}
                name={f.name}
                type={f.kind}
                required={f.required}
                maxLength={f.kind === "email" ? 254 : 300}
                autoComplete={f.name === "firstname" ? "given-name" : f.name === "lastname" ? "family-name" : f.kind === "email" ? "email" : undefined}
              />
            )}
          </div>
        );
      })}
      {error && (
        <p ref={errorRef} role="alert" tabIndex={-1} className="form-error span-2">
          {error}
        </p>
      )}
      {formKey === "mailing-list" && (
        <p className="form-note micro span-2">
          {MAILING_LIST_CONSENT.replace(" See our Privacy Policy for how we handle your information.", " ")}
          See our <SmartLink href="/english-privacy-policy">Privacy Policy</SmartLink> for how we handle your information.
        </p>
      )}
      <button type="submit" className="button-solid span-2" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : formKey === "mailing-list" ? "Subscribe" : "Submit"} <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
