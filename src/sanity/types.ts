import type { PortableTextBlock } from "next-sanity";

/** Hand-written result types for src/sanity/queries.ts (swap for `sanity typegen` output later). */

export type Link = { label?: string; href?: string };

export type SanityImage = {
  _type?: "image";
  alt?: string;
  asset?: { _id: string; url: string; metadata?: { lqip?: string; dimensions?: { width: number; height: number } } };
  hotspot?: unknown;
  crop?: unknown;
};

export type Rail = { number?: string; label?: string; caption?: string };

export type Disclaimer = {
  _id: string;
  title?: string;
  scope: string;
  version: number;
  kicker?: string;
  heading: string;
  instruction?: string;
  body: PortableTextBlock[];
  acceptLabel?: string;
  declineLabel?: string;
  declineHref?: string;
  requireScroll?: boolean;
  persistence?: "session" | "days30";
  logAcceptance?: boolean;
};

export type SiteSettings = {
  siteName?: string;
  defaultDescription?: string;
  email?: string;
  addressLines?: string[];
  locationShort?: string;
  linkedin?: string;
  headerCta?: Link;
  mainNav?: Link[];
  footerTagline?: string;
  footerNav?: Link[];
  legalLinks?: Link[];
  footerDisclosure?: PortableTextBlock[];
  siteDisclaimer?: Disclaimer | null;
} | null;

type Base = { _key: string; rail?: Rail; anchor?: string; tone?: "light" | "dark" };

export type Section = Base &
  (
    | { _type: "heroPortal"; eyebrow?: string; heading: string; subheading?: string; image?: SanityImage;
        panels?: { _key: string; meta?: string; title: string; tagline?: string; link?: Link }[];
        strip?: { title?: string; tagline?: string; link?: Link } }
    | { _type: "heroPage"; eyebrow?: string; heading: string; intro?: string; image?: SanityImage;
        stats?: { _key: string; label?: string; value?: string }[]; ctas?: (Link & { _key: string })[] }
    | { _type: "statement"; eyebrow?: string; text: string; body?: string; cta?: Link }
    | { _type: "explainer"; label?: string; heading?: string; subheading?: string; body?: PortableTextBlock[];
        tags?: string[]; image?: SanityImage; ctas?: (Link & { _key: string })[] }
    | { _type: "cardGrid"; heading?: string; intro?: string;
        cards?: { _key: string; icon?: SanityImage; title: string; subtitle?: string; body?: string; cta?: Link }[] }
    | { _type: "stepper"; eyebrow?: string; heading?: string; intro?: string;
        steps?: { _key: string; title: string; body?: string }[]; footnote?: string; cta?: Link }
    | { _type: "timeline"; eyebrow?: string; heading?: string; intro?: string;
        chapters?: { _key: string; marker?: string; title: string; epigraph?: string; attribution?: string;
          body?: PortableTextBlock[]; image?: SanityImage }[] }
    | { _type: "objectives"; eyebrow?: string; heading?: string; intro?: string;
        rows?: { _key: string; title: string; body?: string }[]; cta?: Link }
    | { _type: "teamGrid"; heading?: string;
        members?: { _id: string; name: string; role?: string; linkedin?: string; bio?: string; photo?: SanityImage }[] }
    | { _type: "contactBlock"; heading?: string; body?: string; showEmail?: boolean; showLocation?: boolean; cta?: Link }
    | { _type: "formsSection"; heading?: string; intro?: string; note?: string;
        forms?: { _key: string; title: string; key: "portfolio-manager" | "allocator"; hubspotFormId?: string; successMessage?: string }[] }
    | { _type: "marquee"; items?: string[] }
    | { _type: "quote"; text: string; attribution?: string }
    | { _type: "cta"; heading: string; body?: string; link?: Link; note?: string }
    | { _type: "imageBand"; image?: SanityImage; caption?: string }
    | { _type: "legalText"; heading?: string; lastUpdated?: string; body?: PortableTextBlock[] }
    | { _type: "toolEmbed"; tool: "leverage-calculator"; heading?: string; intro?: string }
    | { _type: "keyFacts"; heading?: string; note?: string;
        facts?: { _key: string; label: string; value: string; emphasis?: boolean }[] }
    | { _type: "fundPerformance"; heading?: string; intro?: string; fundLabel: string; benchmarkLabel?: string;
        asOf?: string; footnote?: string;
        years?: { _key: string; year: number; fund?: number[]; benchmark?: number[]; fundYtd?: number; benchmarkYtd?: number }[] }
    | { _type: "dataTable"; heading?: string; intro?: string; columns?: string[]; note?: string;
        rows?: { _key: string; cells?: string[]; total?: boolean }[] }
    | { _type: "barList"; heading?: string; intro?: string; unit?: string; signed?: boolean;
        bars?: { _key: string; label: string; value: number; note?: string }[] }
  );
