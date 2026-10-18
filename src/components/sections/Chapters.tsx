"use client";

import { useRef } from "react";
import type { Section } from "@/sanity/types";
import { useMediaQuery, usePrefersReducedMotion, useScrollProgress } from "@/lib/useScrollProgress";
import { Heading, Rail, RichText, SanityImg } from "./shared";

type S = Extract<Section, { _type: "timeline" }>;

/**
 * Chapters: on wide screens the section pins and vertical scroll drives a horizontal
 * pass through each chapter (giant outlined marker behind). On small screens, without JS,
 * or with reduced motion it's a plain vertical stack. Same markup either way.
 */
export function Chapters({ s, first }: { s: S; first: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const wide = useMediaQuery("(min-width: 900px)");
  const reduced = usePrefersReducedMotion();
  const chapters = s.chapters ?? [];
  const horizontal = wide && !reduced && chapters.length > 1;
  const progress = useScrollProgress(track, horizontal);
  const index = Math.min(chapters.length - 1, Math.round(progress * (chapters.length - 1)));

  return (
    <section id={s.anchor} data-tone={s.tone === "dark" ? "dark" : undefined} className="section section-timeline">
      <Rail rail={s.rail} />
      {(s.heading || s.intro) && (
        <div className="grid-2" data-reveal>
          {s.heading && <Heading first={first}>{s.heading}</Heading>}
          {s.intro && <p className="lead">{s.intro}</p>}
        </div>
      )}
      <div
        ref={track}
        className="chapters-track"
        data-mode={horizontal ? "rail" : "stack"}
        style={horizontal ? { height: `${chapters.length * 100}svh` } : undefined}
      >
        <div className="chapters-sticky" style={horizontal ? { marginInline: "calc(var(--gutter) * -1)" } : undefined}>
          <ol
            className="chapters-rail"
            style={horizontal ? { transform: `translate3d(${-progress * (chapters.length - 1) * 100}vw, 0, 0)`, listStyle: "none", margin: 0, padding: 0 } : { listStyle: "none", margin: 0, padding: 0 }}
          >
            {chapters.map((c, i) => (
              <li key={c._key} className="chapter" aria-current={horizontal && i === index ? "step" : undefined}>
                {c.marker && (
                  <span className="chapter-marker" aria-hidden="true">
                    {c.marker}
                  </span>
                )}
                <div className="chapter-inner">
                  <p className="micro">
                    {String(i + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}
                  </p>
                  {/* No section heading → the chapter titles are the next level under the page H1. */}
                  {s.heading ? <h3 className="chapter-title">{c.title}</h3> : <h2 className="chapter-title">{c.title}</h2>}
                  {c.epigraph && (
                    <figure className="epigraph">
                      <blockquote>{c.epigraph}</blockquote>
                      {c.attribution && <figcaption className="micro">— {c.attribution}</figcaption>}
                    </figure>
                  )}
                  <RichText value={c.body} className="body" />
                  {c.image?.asset && (
                    <div style={{ marginTop: 24 }}>
                      <SanityImg image={c.image} sizes="(min-width: 900px) 40vw, 100vw" />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
          {horizontal && (
            <div className="chapters-progress micro" aria-hidden="true">
              <span>{chapters[index]?.title}</span>
              <span>
                {String(index + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
