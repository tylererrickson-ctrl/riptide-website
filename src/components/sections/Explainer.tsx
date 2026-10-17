import type { Section } from "@/sanity/types";
import { Ctas, Heading, RichText, SanityImg, Shell } from "./shared";

type S = Extract<Section, { _type: "explainer" }>;

/** Label + heading on the left, body/tags/buttons on the right. */
export function Explainer({ s, first }: { s: S; first: boolean }) {
  const hasRight = !!(s.body?.length || s.tags?.length || s.ctas?.length || s.image?.asset);
  const showLabel = !!(s.label && !s.rail?.label);
  const hasLeft = !!(showLabel || s.heading || s.subheading);
  return (
    <Shell s={s} className="explainer">
      <div className={hasRight && hasLeft ? "grid-2" : undefined}>
        {hasLeft && (
        <div className="stack" data-reveal>
          {showLabel && <p className="micro">{s.label}</p>}
          {s.heading && (
            <Heading first={first} className="explainer-heading">
              {s.heading}
            </Heading>
          )}
          {s.subheading && <p className="subheading">{s.subheading}</p>}
        </div>
        )}
        {hasRight && (
          <div className="stack" data-reveal>
            <RichText value={s.body} className="body" />
            {!!s.tags?.length && (
              <ul className="tags">
                {s.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
            <Ctas links={s.ctas} />
            {s.image?.asset && (
              <div className="explainer-image">
                <SanityImg image={s.image} sizes="(min-width: 900px) 55vw, 100vw" />
              </div>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}
