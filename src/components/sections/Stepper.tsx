"use client";

import { useEffect, useRef, useState } from "react";
import type { Section } from "@/sanity/types";
import { Cta, Heading, Rail } from "./shared";

type S = Extract<Section, { _type: "stepper" }>;

/** Process stepper: a line fills and each node lights up as the steps scroll through the middle of the viewport. */
export function Stepper({ s, first }: { s: S; first: boolean }) {
  const listRef = useRef<HTMLOListElement>(null);
  const [progress, setProgress] = useState(0);
  const steps = s.steps ?? [];

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setProgress(1));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the list's top is at 85% of the viewport, 1 when its bottom passes 45%.
      const start = vh * 0.85;
      const end = vh * 0.45;
      const span = r.height + (start - end);
      setProgress(Math.min(1, Math.max(0, (start - r.top) / span)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const lit = Math.ceil(progress * steps.length - 0.0001);

  return (
    <section id={s.anchor} data-tone={s.tone === "dark" ? "dark" : undefined} className="section stepper">
      <Rail rail={s.rail} />
      <div className="grid-2" style={{ marginBottom: "clamp(40px, 6vw, 88px)" }}>
        <div className="stack">
          {s.eyebrow && !s.rail?.label && <p className="micro">{s.eyebrow}</p>}
          {s.heading && <Heading first={first}>{s.heading}</Heading>}
        </div>
        {s.intro && <p className="lead">{s.intro}</p>}
      </div>
      <div className="stepper-track" style={{ ["--progress" as string]: progress }}>
        <span className="steps-line" aria-hidden="true" />
        <span className="steps-line-fill" aria-hidden="true" />
        <ol ref={listRef} className="steps">
          {steps.map((st, i) => (
            <li key={st._key} className="step" data-on={i < lit}>
              <span className="step-node" aria-hidden="true" />
              <span className="micro">{String(i + 1).padStart(2, "0")}</span>
              <h3>{st.title}</h3>
              {st.body && <p>{st.body}</p>}
            </li>
          ))}
        </ol>
      </div>
      {s.footnote && <p className="footnote">{s.footnote}</p>}
      {s.cta && (
        <div style={{ marginTop: 24 }}>
          <Cta link={s.cta} accent />
        </div>
      )}
    </section>
  );
}
