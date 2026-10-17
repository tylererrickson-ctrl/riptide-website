import type { Section } from "@/sanity/types";
import { Cta, Heading, SanityImg, Shell } from "./shared";

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
        {s.cards?.map((c, i) => (
          <li key={c._key} className="card" data-reveal>
            <div className="card-top">
              <span className="micro">{String(i + 1).padStart(2, "0")}</span>
              <SanityImg image={c.icon} sizes="44px" width={176} className="card-icon" />
            </div>
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
