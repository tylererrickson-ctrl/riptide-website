import Image from "next/image";
import { PortableText, type PortableTextComponents } from "next-sanity";
import type { Section, SanityImage, Link as LinkT, Rail, SiteSettings } from "@/sanity/types";
import { urlFor } from "@/sanity/image";
import { SmartLink } from "./SmartLink";
import { LeverageCalculator } from "./tools/LeverageCalculator";
import { ContactForms } from "./ContactForms";

/**
 * Phase 2: semantic, unstyled-ish renderers for every CMS section type.
 * Phase 3 replaces the presentation (design tokens, motion) without changing the data contract.
 */

const pt: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => <SmartLink href={value?.href ?? "#"}>{children}</SmartLink>,
  },
};

function Heading({ first, children, className }: { first: boolean; children: React.ReactNode; className?: string }) {
  return first ? <h1 className={className}>{children}</h1> : <h2 className={className}>{children}</h2>;
}

function RailRow({ rail }: { rail?: Rail }) {
  if (!rail?.number && !rail?.label && !rail?.caption) return null;
  return (
    <div className="rail">
      <span>
        {rail.number}
        {rail.number && rail.label ? " — " : ""}
        {rail.label}
      </span>
      {rail.caption && <span className="rail-caption">{rail.caption}</span>}
    </div>
  );
}

function Img({ image, sizes, priority, className }: { image?: SanityImage; sizes: string; priority?: boolean; className?: string }) {
  if (!image?.asset) return null;
  const d = image.asset.metadata?.dimensions;
  return (
    <Image
      className={className}
      src={urlFor(image).width(2400).fit("max").auto("format").url()}
      width={d?.width ?? 1600}
      height={d?.height ?? 900}
      alt={image.alt ?? ""}
      sizes={sizes}
      priority={priority}
      placeholder={image.asset.metadata?.lqip ? "blur" : "empty"}
      blurDataURL={image.asset.metadata?.lqip}
    />
  );
}

function Cta({ link, className = "bracket" }: { link?: LinkT; className?: string }) {
  if (!link?.href || !link.label) return null;
  return (
    <SmartLink href={link.href} className={className}>
      <span>{link.label}</span>
    </SmartLink>
  );
}

function SectionShell({ s, children, className = "" }: { s: Section; children: React.ReactNode; className?: string }) {
  return (
    <section id={s.anchor} data-tone={s.tone ?? "light"} className={`section section-${s._type} ${className}`}>
      <RailRow rail={s.rail} />
      {children}
    </section>
  );
}

function SectionView({ s, first, settings }: { s: Section; first: boolean; settings: SiteSettings }) {
  switch (s._type) {
    case "heroPortal":
      return (
        <section className="section section-heroPortal" data-tone="dark">
          <Img image={s.image} sizes="100vw" priority className="hero-media" />
          <div className="hero-statement">
            {s.eyebrow && <p className="micro">{s.eyebrow}</p>}
            <Heading first={first}>{s.heading}</Heading>
            {s.subheading && <p className="lead">{s.subheading}</p>}
          </div>
          {!!s.panels?.length && (
            <ul className="portal-panels">
              {s.panels.map((p, i) => (
                <li key={p._key}>
                  <span className="micro">{String(i + 1).padStart(2, "0")}</span>
                  {p.meta && <span className="micro">{p.meta}</span>}
                  <h2>{p.title}</h2>
                  {p.tagline && <p className="micro">{p.tagline}</p>}
                  <Cta link={p.link} />
                </li>
              ))}
            </ul>
          )}
          {s.strip?.title && (
            <div className="portal-strip">
              <h2>{s.strip.title}</h2>
              {s.strip.tagline && <p className="micro">{s.strip.tagline}</p>}
              <Cta link={s.strip.link} />
            </div>
          )}
        </section>
      );
    case "heroPage":
      return (
        <SectionShell s={s}>
          {s.eyebrow && <p className="micro">{s.eyebrow}</p>}
          <Heading first={first}>{s.heading}</Heading>
          {s.intro && <p className="lead">{s.intro}</p>}
          {!!s.stats?.length && (
            <dl className="stats">
              {s.stats.map((st) => (
                <div key={st._key}>
                  <dt className="micro">{st.label}</dt>
                  <dd>{st.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {s.ctas?.map((c) => <Cta key={c._key} link={c} />)}
          <Img image={s.image} sizes="100vw" priority={first} />
        </SectionShell>
      );
    case "statement":
      return (
        <SectionShell s={s}>
          {s.eyebrow && <p className="micro">{s.eyebrow}</p>}
          <Heading first={first} className="statement">{s.text}</Heading>
          {s.body && <p>{s.body}</p>}
          <Cta link={s.cta} />
        </SectionShell>
      );
    case "explainer":
      return (
        <SectionShell s={s}>
          {s.label && <p className="micro">{s.label}</p>}
          {s.heading && <Heading first={first}>{s.heading}</Heading>}
          {s.subheading && <p className="subheading">{s.subheading}</p>}
          {s.body && <PortableText value={s.body} components={pt} />}
          {!!s.tags?.length && (
            <ul className="tags">
              {s.tags.map((t) => <li key={t}>{t}</li>)}
            </ul>
          )}
          <Img image={s.image} sizes="(min-width: 768px) 50vw, 100vw" />
          {s.ctas?.map((c) => <Cta key={c._key} link={c} />)}
        </SectionShell>
      );
    case "cardGrid":
      return (
        <SectionShell s={s}>
          {s.heading && <Heading first={first}>{s.heading}</Heading>}
          {s.intro && <p className="lead">{s.intro}</p>}
          <ul className="cards">
            {s.cards?.map((c) => (
              <li key={c._key}>
                <Img image={c.icon} sizes="64px" className="card-icon" />
                <h3>{c.title}</h3>
                {c.subtitle && <p className="subheading">{c.subtitle}</p>}
                {c.body && <p>{c.body}</p>}
                <Cta link={c.cta} />
              </li>
            ))}
          </ul>
        </SectionShell>
      );
    case "stepper":
      return (
        <SectionShell s={s}>
          {s.eyebrow && <p className="micro">{s.eyebrow}</p>}
          {s.heading && <Heading first={first}>{s.heading}</Heading>}
          {s.intro && <p className="lead">{s.intro}</p>}
          <ol className="steps">
            {s.steps?.map((st, i) => (
              <li key={st._key}>
                <span className="micro">{String(i + 1).padStart(2, "0")}</span>
                <h3>{st.title}</h3>
                {st.body && <p>{st.body}</p>}
              </li>
            ))}
          </ol>
          {s.footnote && <p className="footnote">{s.footnote}</p>}
          <Cta link={s.cta} />
        </SectionShell>
      );
    case "timeline":
      return (
        <SectionShell s={s}>
          {s.eyebrow && <p className="micro">{s.eyebrow}</p>}
          {s.heading && <Heading first={first}>{s.heading}</Heading>}
          {s.intro && <p className="lead">{s.intro}</p>}
          <ol className="chapters">
            {s.chapters?.map((c) => (
              <li key={c._key}>
                {c.marker && <span className="chapter-marker" aria-hidden="true">{c.marker}</span>}
                <h3>{c.title}</h3>
                {c.epigraph && (
                  <figure className="epigraph">
                    <blockquote>{c.epigraph}</blockquote>
                    {c.attribution && <figcaption>{c.attribution}</figcaption>}
                  </figure>
                )}
                {c.body && <PortableText value={c.body} components={pt} />}
                <Img image={c.image} sizes="(min-width: 768px) 40vw, 100vw" />
              </li>
            ))}
          </ol>
        </SectionShell>
      );
    case "objectives":
      return (
        <SectionShell s={s}>
          {s.eyebrow && <p className="micro">{s.eyebrow}</p>}
          {s.heading && <Heading first={first}>{s.heading}</Heading>}
          {s.intro && <p className="lead">{s.intro}</p>}
          <dl className="rows">
            {s.rows?.map((r) => (
              <div key={r._key}>
                <dt>{r.title}</dt>
                {r.body && <dd>{r.body}</dd>}
              </div>
            ))}
          </dl>
          <Cta link={s.cta} />
        </SectionShell>
      );
    case "teamGrid":
      return (
        <SectionShell s={s}>
          {s.heading && <Heading first={first}>{s.heading}</Heading>}
          <ul className="team">
            {s.members?.map((m) => (
              <li key={m._id}>
                <Img image={m.photo} sizes="(min-width: 768px) 25vw, 50vw" />
                <h3>
                  {m.linkedin ? <a href={m.linkedin} rel="noopener noreferrer" target="_blank">{m.name}</a> : m.name}
                </h3>
                {m.role && <p className="micro">{m.role}</p>}
              </li>
            ))}
          </ul>
        </SectionShell>
      );
    case "contactBlock":
      return (
        <SectionShell s={s}>
          {s.heading && <Heading first={first}>{s.heading}</Heading>}
          {s.body && <p>{s.body}</p>}
          <dl className="contact-details">
            {s.showEmail !== false && settings?.email && (
              <div>
                <dt className="micro">Email</dt>
                <dd><a href={`mailto:${settings.email}`}>{settings.email}</a></dd>
              </div>
            )}
            {s.showLocation !== false && settings?.locationShort && (
              <div>
                <dt className="micro">Location</dt>
                <dd>{settings.locationShort}</dd>
              </div>
            )}
          </dl>
        </SectionShell>
      );
    case "formsSection":
      return (
        <SectionShell s={s}>
          {s.heading && <Heading first={first}>{s.heading}</Heading>}
          {s.intro && <p className="lead">{s.intro}</p>}
          <ContactForms forms={s.forms ?? []} />
          {s.note && <p className="footnote">{s.note}</p>}
        </SectionShell>
      );
    case "marquee":
      return (
        <SectionShell s={s}>
          <ul className="marquee">{s.items?.map((t) => <li key={t}>{t}</li>)}</ul>
        </SectionShell>
      );
    case "quote":
      return (
        <SectionShell s={s}>
          <figure className="pullquote">
            <blockquote>{s.text}</blockquote>
            {s.attribution && <figcaption className="micro">{s.attribution}</figcaption>}
          </figure>
        </SectionShell>
      );
    case "cta":
      return (
        <SectionShell s={s}>
          <Heading first={first}>{s.heading}</Heading>
          {s.body && <p>{s.body}</p>}
          <Cta link={s.link} />
          {s.note && <p className="footnote">{s.note}</p>}
        </SectionShell>
      );
    case "imageBand":
      return (
        <SectionShell s={s}>
          <figure>
            <Img image={s.image} sizes="100vw" />
            {s.caption && <figcaption className="micro">{s.caption}</figcaption>}
          </figure>
        </SectionShell>
      );
    case "legalText":
      return (
        <SectionShell s={s} className="prose">
          {s.heading && <Heading first={first}>{s.heading}</Heading>}
          {s.lastUpdated && <p className="micro">Last updated {s.lastUpdated}</p>}
          {s.body && <PortableText value={s.body} components={pt} />}
        </SectionShell>
      );
    case "toolEmbed":
      return (
        <SectionShell s={s}>
          {s.heading && <Heading first={first}>{s.heading}</Heading>}
          {s.intro && <p className="lead">{s.intro}</p>}
          {s.tool === "leverage-calculator" && <LeverageCalculator />}
        </SectionShell>
      );
    default:
      return null;
  }
}

export function Sections({ sections, settings }: { sections: Section[]; settings: SiteSettings }) {
  return (
    <>
      {sections.map((s, i) => (
        <SectionView key={s._key} s={s} first={i === 0} settings={settings} />
      ))}
    </>
  );
}
