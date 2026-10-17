import type { SiteSettings } from "@/sanity/types";
import { siteUrl } from "@/lib/site";

/** Organization structured data (schema.org), built from Site settings. */
export function OrganizationJsonLd({ settings }: { settings: SiteSettings }) {
  const lines = settings?.addressLines ?? [];
  const cityLine = lines[1] ?? ""; // e.g. "Greenwich CT 06830"
  const m = cityLine.match(/^(.*?)[,\s]+([A-Z]{2})\s+(\d{5})/);
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: settings?.siteName ?? "Riptide Advisors",
    url: siteUrl,
    logo: `${siteUrl}/images/logo-horizontal-color.png`,
    ...(settings?.defaultDescription ? { description: settings.defaultDescription } : {}),
    ...(settings?.email ? { email: settings.email } : {}),
    ...(lines.length
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: lines[0],
            ...(m ? { addressLocality: m[1], addressRegion: m[2], postalCode: m[3] } : {}),
            addressCountry: "US",
          },
        }
      : {}),
    ...(settings?.linkedin ? { sameAs: [settings.linkedin] } : {}),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }}
    />
  );
}
