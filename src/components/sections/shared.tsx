import Image from "next/image";
import { PortableText, type PortableTextBlock, type PortableTextComponents } from "next-sanity";
import type { Link as LinkT, Rail as RailT, SanityImage } from "@/sanity/types";
import { urlFor } from "@/sanity/image";
import { SmartLink } from "../SmartLink";

export const ptComponents: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => <SmartLink href={value?.href ?? "#"}>{children}</SmartLink>,
  },
};

export function RichText({ value, className }: { value?: PortableTextBlock[]; className?: string }) {
  if (!value?.length) return null;
  return (
    <div className={className}>
      <PortableText value={value} components={ptComponents} />
    </div>
  );
}

/** First section's heading is the page H1; every other section heading is an H2. */
export function Heading({
  first,
  children,
  className,
  id,
}: {
  first: boolean;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return first ? (
    <h1 className={className} id={id}>
      {children}
    </h1>
  ) : (
    <h2 className={className} id={id}>
      {children}
    </h2>
  );
}

/** Section label row. When a section has no large heading, the label is promoted to its <h2> (same look). */
export function Rail({ rail, asHeading = false }: { rail?: RailT; asHeading?: boolean }) {
  if (!rail?.number && !rail?.label && !rail?.caption) return null;
  const Label = asHeading ? "h2" : "span";
  return (
    <div className="rail micro" data-reveal>
      <Label className="rail-label">
        {rail.number && <span className="rail-num">{rail.number} — </span>}
        {rail.label}
      </Label>
      {rail.caption && <span className="rail-caption">{rail.caption}</span>}
    </div>
  );
}

export function SanityImg({
  image,
  sizes,
  priority,
  className,
  width = 2400,
}: {
  image?: SanityImage;
  sizes: string;
  priority?: boolean;
  className?: string;
  width?: number;
}) {
  if (!image?.asset) return null;
  const d = image.asset.metadata?.dimensions;
  return (
    <Image
      className={className}
      src={urlFor(image).width(width).fit("max").auto("format").url()}
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

export function Cta({ link, accent, className = "" }: { link?: LinkT; accent?: boolean; className?: string }) {
  if (!link?.href || !link.label) return null;
  return (
    <SmartLink href={link.href} className={`bracket ${accent ? "bracket-accent" : ""} ${className}`}>
      <span>{link.label}</span>
      <span className="arrow" aria-hidden="true">
        →
      </span>
    </SmartLink>
  );
}

export function Ctas({ links }: { links?: (LinkT & { _key?: string })[] }) {
  if (!links?.length) return null;
  return (
    <div className="ctas">
      {links.map((l, i) => (
        <Cta key={l._key ?? i} link={l} accent={i === 0} />
      ))}
    </div>
  );
}

export function Shell({
  s,
  children,
  className = "",
  labelledBy,
}: {
  s: { _type: string; rail?: RailT; anchor?: string; tone?: "light" | "dark"; heading?: string };
  children: React.ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  const headingless = !("heading" in s && s.heading);
  return (
    <section
      id={s.anchor}
      data-tone={s.tone === "dark" ? "dark" : undefined}
      className={`section section-${s._type} ${className}`}
      aria-labelledby={labelledBy}
    >
      <Rail rail={s.rail} asHeading={headingless} />
      {children}
    </section>
  );
}
