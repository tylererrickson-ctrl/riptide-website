import type { Metadata, Viewport } from "next";
import { draftMode } from "next/headers";
import { Suspense } from "react";
import { fontVars } from "../fonts";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive, cachedSanity } from "@/sanity/live";
import { SETTINGS_QUERY } from "@/sanity/queries";
import { isIndexable, siteUrl } from "@/lib/site";
import { SiteHeader, SiteHeaderWithPath } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { IntroLoader } from "@/components/IntroLoader";
import { RevealObserver } from "@/components/RevealObserver";
import { ScrollToTop } from "@/components/ScrollToTop";
import { OrganizationJsonLd } from "@/components/OrganizationJsonLd";
import type { SiteSettings } from "@/sanity/types";
import "./globals.css";

/** Runs before first paint: JS flag, page opens at the top on reload, saved theme, intro-seen flag. Dependency-free. */
const preflight = `(function(){var h=document.documentElement;h.classList.add("js");
try{if("scrollRestoration" in history)history.scrollRestoration="manual"}catch(e){}
try{var t=localStorage.getItem("rt-theme");if(t==="light"||t==="dark")h.setAttribute("data-theme",t)}catch(e){}
try{if(sessionStorage.getItem("rt-intro"))h.setAttribute("data-intro-seen","")}catch(e){h.setAttribute("data-intro-seen","")}})();`;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f5" },
    { media: "(prefers-color-scheme: dark)", color: "#06131f" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const { data: raw } = await cachedSanity({ query: SETTINGS_QUERY, perspective: "published", stega: false });
  const data = raw as SiteSettings;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: data?.siteName ?? "Riptide Advisors", template: `%s` },
    description: data?.defaultDescription ?? undefined,
    robots: isIndexable ? { index: true, follow: true } : { index: false, follow: false },
    icons: { icon: "/images/logo-mark.png", apple: "/images/logo-mark.png" },
    // Google Search Console / Bing Webmaster "HTML tag" verification, so ownership can be proven
    // without touching DNS. Set the token(s) in Vercel env; absent = no tag rendered.
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
      other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
    },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled: isDraftMode } = await draftMode();
  const { data } = await cachedSanity({ query: SETTINGS_QUERY, perspective: "published", stega: false });
  const settings = data as SiteSettings;

  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preflight }} />
        <OrganizationJsonLd settings={settings} />
      </head>
      <body>
        <IntroLoader />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Suspense fallback={<SiteHeader settings={settings} />}>
          <SiteHeaderWithPath settings={settings} />
        </Suspense>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter settings={settings} />
        <Suspense fallback={null}>
          <RevealObserver />
          <ScrollToTop />
        </Suspense>
        <SanityLive includeDrafts={isDraftMode} />
        {isDraftMode && <VisualEditing />}
      </body>
    </html>
  );
}
