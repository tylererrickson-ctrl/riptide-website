import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive, cachedSanity } from "@/sanity/live";
import { SETTINGS_QUERY } from "@/sanity/queries";
import { isIndexable, siteUrl } from "@/lib/site";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import type { SiteSettings } from "@/sanity/types";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { data: raw } = await cachedSanity({ query: SETTINGS_QUERY, perspective: "published", stega: false });
  const data = raw as SiteSettings;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: data?.siteName ?? "Riptide Advisors", template: `%s` },
    description: data?.defaultDescription ?? undefined,
    robots: isIndexable ? { index: true, follow: true } : { index: false, follow: false },
    icons: { icon: "/images/logo-mark.png", apple: "/images/logo-mark.png" },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled: isDraftMode } = await draftMode();
  const { data } = await cachedSanity({ query: SETTINGS_QUERY, perspective: "published", stega: false });
  const settings = data as SiteSettings;

  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader settings={settings} />
        <main id="main">{children}</main>
        <SiteFooter settings={settings} />
        <SanityLive includeDrafts={isDraftMode} />
        {isDraftMode && <VisualEditing />}
      </body>
    </html>
  );
}
