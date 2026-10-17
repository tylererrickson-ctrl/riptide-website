import type { Section, SiteSettings } from "@/sanity/types";
import { PortalHero } from "./PortalHero";
import { PageHero } from "./PageHero";
import { Statement } from "./Statement";
import { Explainer } from "./Explainer";
import { CardGrid } from "./CardGrid";
import { Stepper } from "./Stepper";
import { Chapters } from "./Chapters";
import {
  ContactBlock,
  CtaBlock,
  FormsSection,
  ImageBand,
  LegalText,
  Marquee,
  Quote,
  Rows,
  TeamGrid,
  ToolEmbed,
} from "./Simple";

function SectionView({ s, first, settings }: { s: Section; first: boolean; settings: SiteSettings }) {
  switch (s._type) {
    case "heroPortal":
      return <PortalHero s={s} first={first} />;
    case "heroPage":
      return <PageHero s={s} first={first} />;
    case "statement":
      return <Statement s={s} first={first} />;
    case "explainer":
      return <Explainer s={s} first={first} />;
    case "cardGrid":
      return <CardGrid s={s} first={first} />;
    case "stepper":
      return <Stepper s={s} first={first} />;
    case "timeline":
      return <Chapters s={s} first={first} />;
    case "objectives":
      return <Rows s={s} first={first} />;
    case "teamGrid":
      return <TeamGrid s={s} first={first} />;
    case "contactBlock":
      return <ContactBlock s={s} first={first} settings={settings} />;
    case "formsSection":
      return <FormsSection s={s} first={first} />;
    case "marquee":
      return <Marquee s={s} />;
    case "quote":
      return <Quote s={s} />;
    case "cta":
      return <CtaBlock s={s} first={first} />;
    case "imageBand":
      return <ImageBand s={s} />;
    case "legalText":
      return <LegalText s={s} first={first} />;
    case "toolEmbed":
      return <ToolEmbed s={s} first={first} />;
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
