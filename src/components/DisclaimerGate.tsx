"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { PortableText } from "next-sanity";
import type { Disclaimer } from "@/sanity/types";

/**
 * Regulatory disclaimer gate. Behavior spec: migration/design-reference.md ("Disclaimer gate: Riptide spec").
 *
 * - Server-rendered visible (blocks the page by default, including before hydration).
 * - An inline script hides it before first paint when this scope+version was already accepted,
 *   by adding a token to <html data-gate-ok>. CSS keys off that token.
 * - When open: page behind is `inert`, scroll is locked, focus is trapped, Esc does nothing.
 * - Acceptance is stored per scope + version (sessionStorage, or localStorage with a 30-day expiry).
 */

const STORAGE_PREFIX = "rt-gate:";
const DAYS_30 = 30 * 24 * 60 * 60 * 1000;

const tokenOf = (d: Pick<Disclaimer, "scope" | "version">) => `${d.scope}-v${d.version}`;

/** Runs synchronously during HTML parsing. Must stay dependency-free. */
const preflight = `(function(){try{var h=document.documentElement,ok=(h.getAttribute("data-gate-ok")||"").split(" ");
for(var i=0;i<sessionStorage.length;i++){var k=sessionStorage.key(i);if(k&&k.indexOf("${STORAGE_PREFIX}")===0){ok.push(k.slice(${STORAGE_PREFIX.length})+"-v"+sessionStorage.getItem(k))}}
for(var j=0;j<localStorage.length;j++){var q=localStorage.key(j);if(q&&q.indexOf("${STORAGE_PREFIX}")===0){var v=JSON.parse(localStorage.getItem(q)||"{}");if(v.exp>Date.now())ok.push(q.slice(${STORAGE_PREFIX.length})+"-v"+v.version)}}
h.setAttribute("data-gate-ok",ok.filter(Boolean).join(" "))}catch(e){}})();`;

function readAccepted(d: Disclaimer): boolean {
  try {
    if (sessionStorage.getItem(STORAGE_PREFIX + d.scope) === String(d.version)) return true;
    const raw = localStorage.getItem(STORAGE_PREFIX + d.scope);
    if (raw) {
      const v = JSON.parse(raw) as { version?: number; exp?: number };
      if (v.version === d.version && (v.exp ?? 0) > Date.now()) return true;
    }
  } catch {
    /* storage blocked: treat as not accepted */
  }
  return false;
}

function writeAccepted(d: Disclaimer) {
  try {
    if (d.persistence === "days30") {
      localStorage.setItem(STORAGE_PREFIX + d.scope, JSON.stringify({ version: d.version, exp: Date.now() + DAYS_30 }));
    } else {
      sessionStorage.setItem(STORAGE_PREFIX + d.scope, String(d.version));
    }
  } catch {
    /* storage blocked: acceptance lasts for this page view only */
  }
  const h = document.documentElement;
  const ok = new Set((h.getAttribute("data-gate-ok") ?? "").split(" ").filter(Boolean));
  ok.add(tokenOf(d));
  h.setAttribute("data-gate-ok", [...ok].join(" "));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

const CHANGE_EVENT = "rt-gate:change";

function subscribe(cb: () => void) {
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

const OPEN_EVENT = "rt-gate:open";

export function DisclaimerGate({ disclaimer: d, manual = false }: { disclaimer: Disclaimer; manual?: boolean }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const token = tokenOf(d);
  // Server snapshot is "not accepted", so the gate is in the HTML; the inline script + CSS hide it pre-paint
  // when already accepted. On client-side navigations the real value is read immediately.
  const accepted = useSyncExternalStore(subscribe, () => readAccepted(d), () => false);
  // `manual` gates (opened from the footer) never block on load.
  const [manualOpen, setManualOpen] = useState(false);
  const open = manual ? manualOpen : !accepted;
  const [readToEnd, setReadToEnd] = useState(!d.requireScroll);

  // Footer "Disclaimer" button.
  useEffect(() => {
    if (!manual) return;
    const onOpen = (e: Event) => {
      if ((e as CustomEvent<string>).detail === d.scope) setManualOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [d.scope, manual]);

  // While open: inert background, scroll lock, focus management.
  useEffect(() => {
    const el = ref.current;
    if (!open || !el) return;
    const others = Array.from(document.body.children).filter(
      (n): n is HTMLElement => n instanceof HTMLElement && !n.contains(el),
    );
    const mainSiblings = el.parentElement
      ? Array.from(el.parentElement.children).filter((n): n is HTMLElement => n instanceof HTMLElement && n !== el)
      : [];
    const targets = [...others, ...mainSiblings];
    targets.forEach((n) => n.setAttribute("inert", ""));
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const previouslyFocused = document.activeElement as HTMLElement | null;
    el.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault(); // intentional: the notice must be accepted or declined
        return;
      }
      if (e.key !== "Tab") return;
      const f = el.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      targets.forEach((n) => n.removeAttribute("inert"));
      document.documentElement.style.overflow = prevOverflow;
      if (manual) previouslyFocused?.focus?.();
    };
  }, [open, manual]);

  const onScrollBody = useCallback(() => {
    const b = bodyRef.current;
    if (b && b.scrollTop + b.clientHeight >= b.scrollHeight - 24) setReadToEnd(true);
  }, []);

  // Short notices that don't overflow don't need scrolling.
  const measureBody = useCallback(
    (node: HTMLDivElement | null) => {
      bodyRef.current = node;
      if (node && d.requireScroll && node.scrollHeight <= node.clientHeight + 24) setReadToEnd(true);
    },
    [d.requireScroll],
  );

  const accept = () => {
    writeAccepted(d); // flips `accepted` via the external store
    if (d.logAcceptance) {
      void fetch("/api/gate-log", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scope: d.scope, version: d.version, path: location.pathname }),
        keepalive: true,
      }).catch(() => {});
    }
  };

  const decline = () => {
    if (manual) {
      setManualOpen(false);
      return;
    }
    router.push(d.declineHref || "/");
  };

  return (
    <>
      {!manual && (
        <style
          // Hide this gate when <html data-gate-ok> contains its token (set by the preflight script or on accept).
          dangerouslySetInnerHTML={{
            __html: `html[data-gate-ok~="${token}"] [data-gate="${token}"]:not([data-manual]){display:none!important}`,
          }}
        />
      )}
      {!manual && (
        <script
          // Hard loads: hide the gate before first paint if already accepted.
          type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: preflight }}
        />
      )}
      <div
        ref={ref}
        className="gate"
        data-gate={token}
        data-manual={manual || undefined}
        hidden={!open}
        suppressHydrationWarning
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
      >
        <div className="gate-card">
          <div className="gate-head">
            <span className="micro">{d.kicker ?? "Legal disclaimer"}</span>
          </div>
          <div className="gate-body" ref={measureBody} onScroll={d.requireScroll ? onScrollBody : undefined} tabIndex={0}>
            <h2 id={headingId} tabIndex={-1} data-autofocus>
              {d.heading}
            </h2>
            {d.instruction && <p className="micro gate-instruction">{d.instruction}</p>}
            <div className="gate-text">
              <PortableText value={d.body} />
            </div>
          </div>
          <div className="gate-foot">
            <button type="button" className="bracket bracket-quiet" onClick={decline}>
              <span>{manual ? "Close" : (d.declineLabel ?? "Decline")}</span>
            </button>
            {!manual && (
              <button
                type="button"
                className="bracket bracket-accent"
                onClick={accept}
                disabled={!readToEnd}
                title={!readToEnd ? "Scroll to the end of the notice to continue" : undefined}
              >
                <span>{d.acceptLabel ?? "Accept & enter"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function DisclaimerReopenButton({ disclaimer }: { disclaimer: Disclaimer }) {
  return (
    <>
      <button
        type="button"
        className="link-button"
        onClick={() => window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: disclaimer.scope }))}
      >
        Disclaimer
      </button>
      <DisclaimerGate disclaimer={disclaimer} manual />
    </>
  );
}
