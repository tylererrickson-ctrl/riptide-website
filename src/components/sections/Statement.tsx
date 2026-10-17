"use client";

import { useRef } from "react";
import type { Section } from "@/sanity/types";
import { useScrollProgress } from "@/lib/useScrollProgress";
import { Cta, Heading, Rail } from "./shared";

type S = Extract<Section, { _type: "statement" }>;

/** Pinned statement: the sentence stays in view while its words light up with scroll. */
export function Statement({ s, first }: { s: S; first: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(track);
  const words = s.text.split(/\s+/);
  // Finish lighting at ~70% of the track so the full sentence holds before release.
  const lit = Math.round(Math.min(1, progress / 0.7) * words.length);

  return (
    <section id={s.anchor} data-tone={s.tone === "dark" ? "dark" : undefined} className="section section-statement">
      <Rail rail={s.rail} />
      <div ref={track} className="statement-track">
        <div className="statement-sticky">
          {s.eyebrow && <p className="micro">{s.eyebrow}</p>}
          <Heading first={first} className="statement-text">
            <span className="sr-only">{s.text}</span>
            <span aria-hidden="true">
              {words.map((w, i) => (
                <span key={i} className="w" data-on={i < lit}>
                  {w}{" "}
                </span>
              ))}
            </span>
          </Heading>
          {(s.body || s.cta) && (
            <div className="statement-body stack">
              {s.body && <p className="lead">{s.body}</p>}
              <Cta link={s.cta} accent />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
