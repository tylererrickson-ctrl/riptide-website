import type { Section } from "@/sanity/types";
import { WaveField } from "../WaveField";
import { Ctas, Heading, SanityImg, Shell } from "./shared";

type S = Extract<Section, { _type: "heroPage" }>;

/** Page hero: giant headline left, generative vortex right, key facts, then the page's own image as a band. */
export function PageHero({ s, first }: { s: S; first: boolean }) {
  return (
    <Shell s={s} className="page-hero">
      <div className="page-hero-grid">
        <div>
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
          <Ctas links={s.ctas} />
        </div>
        <div className="hero-visual" aria-hidden="true">
          <WaveField variant="vortex" lines={22} />
        </div>
      </div>
      {s.image?.asset && (
        <div className="hero-band" data-reveal>
          <SanityImg image={s.image} sizes="100vw" priority={first} />
        </div>
      )}
    </Shell>
  );
}
