import Link from "next/link";
import type { Section, SiteSettings } from "@/sanity/types";
import { SmartLink } from "../SmartLink";
import { ContactForms } from "../ContactForms";
import { LeverageCalculator } from "../tools/LeverageCalculator";
import { Cta, Heading, RichText, SanityImg, Shell } from "./shared";

type Of<T extends Section["_type"]> = Extract<Section, { _type: T }>;

export function Rows({ s, first }: { s: Of<"objectives">; first: boolean }) {
  return (
    <Shell s={s}>
      <div className="grid-2" style={{ marginBottom: "clamp(32px, 5vw, 64px)" }} data-reveal>
        <div className="stack">
          {s.eyebrow && !s.rail?.label && <p className="micro">{s.eyebrow}</p>}
          {s.heading && (
            <Heading first={first} className="rows-heading">
              {s.heading}
            </Heading>
          )}
        </div>
        {s.intro && <p className="lead">{s.intro}</p>}
      </div>
      <dl className="rows">
        {s.rows?.map((r) => (
          <div key={r._key} data-reveal>
            <dt>{r.title}</dt>
            {r.body && <dd>{r.body}</dd>}
          </div>
        ))}
      </dl>
      {s.cta && (
        <div style={{ marginTop: 32 }}>
          <Cta link={s.cta} accent />
        </div>
      )}
    </Shell>
  );
}

export function TeamGrid({ s, first }: { s: Of<"teamGrid">; first: boolean }) {
  return (
    <Shell s={s}>
      {s.heading && (
        <Heading first={first} className="explainer-heading">
          {s.heading}
        </Heading>
      )}
      <ul className="team" style={{ marginTop: "clamp(32px, 5vw, 64px)" }}>
        {s.members?.map((m) => {
          const card = (
            <figure>
              <div className="member-photo">
                <SanityImg image={m.photo} sizes="(min-width: 900px) 30vw, (min-width: 600px) 45vw, 100vw" width={1200} />
                {m.linkedin && (
                  <span className="member-linkedin micro" aria-hidden="true">
                    LinkedIn ↗
                  </span>
                )}
              </div>
              <figcaption>
                <h3>{m.name}</h3>
                {m.role && <p className="micro">{m.role}</p>}
              </figcaption>
            </figure>
          );
          return (
            <li key={m._id} className="member" data-reveal>
              {/* Whole card (photo + name) is one link to the person's LinkedIn profile. */}
              {m.linkedin ? (
                <a
                  className="member-link"
                  href={m.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${m.name}${m.role ? `, ${m.role}` : ""} on LinkedIn (opens in a new tab)`}
                >
                  {card}
                </a>
              ) : (
                card
              )}
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}

export function ContactBlock({ s, first, settings }: { s: Of<"contactBlock">; first: boolean; settings: SiteSettings }) {
  return (
    <Shell s={s}>
      <div className="grid-2">
        <div className="stack" data-reveal>
          {s.heading && (
            <Heading first={first} className="explainer-heading">
              {s.heading}
            </Heading>
          )}
          {s.body && <p className="lead">{s.body}</p>}
          {s.cta && <Cta link={s.cta} accent />}
        </div>
        <dl className="contact-details" data-reveal>
          {s.showEmail !== false && settings?.email && (
            <div>
              <dt className="micro">Email</dt>
              <dd>
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </dd>
            </div>
          )}
          {s.showLocation !== false && settings?.addressLines?.length ? (
            <div>
              <dt className="micro">Office</dt>
              <dd style={{ textAlign: "right" }}>
                {settings.addressLines.map((l) => (
                  <span key={l} style={{ display: "block" }}>
                    {l}
                  </span>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </Shell>
  );
}

export function FormsSection({ s, first }: { s: Of<"formsSection">; first: boolean }) {
  return (
    <Shell s={s} className="page-hero">
      <div className="grid-2">
        <div className="stack">
          {s.heading && <Heading first={first}>{s.heading}</Heading>}
          {s.intro && <p className="lead">{s.intro}</p>}
        </div>
        <div>
          <ContactForms forms={s.forms ?? []} />
          {s.note && <p className="form-note micro">{s.note}</p>}
        </div>
      </div>
    </Shell>
  );
}

export function Marquee({ s }: { s: Of<"marquee"> }) {
  const items = s.items ?? [];
  if (!items.length) return null;
  return (
    <section data-tone={s.tone === "dark" ? "dark" : undefined} className="section section-marquee" aria-label="Highlights">
      <div className="marquee micro">
        <div className="marquee-track">
          <ul>
            {items.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <ul aria-hidden="true">
            {items.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Quote({ s }: { s: Of<"quote"> }) {
  return (
    <Shell s={s}>
      <figure className="pullquote" data-reveal>
        <blockquote>{s.text}</blockquote>
        {s.attribution && <figcaption className="micro">{s.attribution}</figcaption>}
      </figure>
    </Shell>
  );
}

export function CtaBlock({ s, first }: { s: Of<"cta">; first: boolean }) {
  const href = s.link?.href;
  const inner = (
    <>
      <Heading first={first}>{s.heading}</Heading>
      <span className="arrow" aria-hidden="true">
        →
      </span>
    </>
  );
  return (
    <Shell s={s}>
      {href ? (
        href.startsWith("/") ? (
          <Link href={href} className="cta-row" data-reveal>
            {inner}
          </Link>
        ) : (
          <SmartLink href={href} className="cta-row">
            {inner}
          </SmartLink>
        )
      ) : (
        <div className="cta-row">{inner}</div>
      )}
      {s.body && <p className="cta-body">{s.body}</p>}
      {s.note && <p className="micro" style={{ marginTop: 12 }}>{s.note}</p>}
    </Shell>
  );
}

export function ImageBand({ s }: { s: Of<"imageBand"> }) {
  if (!s.image?.asset) return null;
  return (
    <Shell s={s}>
      <figure className="image-band" data-reveal>
        <SanityImg image={s.image} sizes="100vw" />
        {s.caption && <figcaption className="micro">{s.caption}</figcaption>}
      </figure>
    </Shell>
  );
}

export function LegalText({ s, first }: { s: Of<"legalText">; first: boolean }) {
  return (
    <Shell s={s} className="page-hero">
      <div className="prose">
        {s.heading && <Heading first={first}>{s.heading}</Heading>}
        {s.lastUpdated && (
          <p className="micro" style={{ marginTop: 16 }}>
            Last updated {s.lastUpdated}
          </p>
        )}
        <RichText value={s.body} />
      </div>
    </Shell>
  );
}

export function ToolEmbed({ s, first }: { s: Of<"toolEmbed">; first: boolean }) {
  return (
    <Shell s={s} className="page-hero">
      <div className="stack" style={{ marginBottom: "clamp(32px, 5vw, 64px)" }}>
        <p className="micro">Parametric VaR · Risk sizing</p>
        {s.heading && <Heading first={first}>{s.heading}</Heading>}
        {s.intro && <p className="lead">{s.intro}</p>}
      </div>
      {s.tool === "leverage-calculator" && <LeverageCalculator />}
    </Shell>
  );
}
