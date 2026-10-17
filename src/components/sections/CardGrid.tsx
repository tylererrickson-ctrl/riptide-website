import type { Section } from "@/sanity/types";
import { urlFor } from "@/sanity/image";
import { Cta, Heading, Shell } from "./shared";

type S = Extract<Section, { _type: "cardGrid" }>;

export function CardGrid({ s, first }: { s: S; first: boolean }) {
  return (
    <Shell s={s}>
      {(s.heading || s.intro) && (
        <div className="grid-2" style={{ marginBottom: "clamp(32px, 5vw, 64px)" }} data-reveal>
          {s.heading && <Heading first={first}>{s.heading}</Heading>}
          {s.intro && <p className="lead">{s.intro}</p>}
        </div>
      )}
      <ul className="cards">
        {s.cards?.map((c) => (
          <li key={c._key} className="card" data-reveal>
            {c.icon?.asset && (
              <div className="card-top">
                {/* Icons are single-colour artwork: used as a mask so they take the theme's brand colour. */}
                <span
                  className="card-icon"
                  aria-hidden="true"
                  style={{ ["--icon" as string]: `url("${urlFor(c.icon).width(176).format("png").url()}")` }}
                />
              </div>
            )}
            <h3>{c.title}</h3>
            {c.subtitle && <p className="subheading">{c.subtitle}</p>}
            {c.body && <p>{c.body}</p>}
            <Cta link={c.cta} />
          </li>
        ))}
      </ul>
    </Shell>
  );
}
