import type { Section } from "@/sanity/types";
import { SmartLink } from "../SmartLink";
import { WaveField } from "../WaveField";
import { Heading, SanityImg } from "./shared";
import { Parallax } from "./Parallax";

type S = Extract<Section, { _type: "heroPortal" }>;

/** Home "portal": one viewport, statement headline, two destination panels, a slim strip. */
export function PortalHero({ s, first }: { s: S; first: boolean }) {
  return (
    <section className="portal" data-tone="dark" data-hero-dark aria-label="Introduction">
      <Parallax className="portal-media">
        <SanityImg image={s.image} sizes="100vw" priority />
      </Parallax>
      <WaveField className="portal-waves" lines={38} intensity={0.9} />
      <div className="portal-statement">
        {s.eyebrow && <p className="micro">{s.eyebrow}</p>}
        <Heading first={first} className="portal-title">
          {s.heading}
        </Heading>
        {s.subheading && <p className="portal-sub">{s.subheading}</p>}
      </div>
      {!!s.panels?.length && (
        <ul className="portal-panels">
          {s.panels.map((p) => (
            <li key={p._key} className="portal-panel">
              {p.meta && (
                <div className="portal-panel-head micro">
                  <span>{p.meta}</span>
                </div>
              )}
              <div>
                <h2>{p.link?.href ? <SmartLink href={p.link.href}>{p.title}</SmartLink> : p.title}</h2>
                {p.tagline && <p className="tagline">{p.tagline}</p>}
              </div>
              {p.link?.label && (
                <div className="portal-panel-foot">
                  <span className="bracket" aria-hidden="true">
                    <span>{p.link.label}</span>
                  </span>
                  <span className="arrow" aria-hidden="true">
                    →
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {s.strip?.title && (
        <div className="portal-strip">
          <div>
            <h2>{s.strip.title}</h2>
            {s.strip.tagline && <p className="micro">{s.strip.tagline}</p>}
          </div>
          {s.strip.link?.href && s.strip.link.label && (
            <SmartLink href={s.strip.link.href} className="bracket bracket-accent">
              <span>{s.strip.link.label}</span>
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </SmartLink>
          )}
        </div>
      )}
    </section>
  );
}
