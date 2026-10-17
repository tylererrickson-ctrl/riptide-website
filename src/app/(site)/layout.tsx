import type { Metadata, Viewport } from "next";
import { draftMode } from "next/headers";
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive, cachedSanity } from "@/sanity/live";
import { SETTINGS_QUERY } from "@/sanity/queries";
import { isIndexable, siteUrl } from "@/lib/site";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { IntroLoader } from "@/components/IntroLoader";
import { RevealObserver } from "@/components/RevealObserver";
import type { SiteSettings } from "@/sanity/types";
import "./globals.css";

const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument-sans", display: "swap" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });

/** Runs before first paint: JS flag, saved theme, intro-seen flag. Dependency-free. */
const preflight = `(function(){var h=document.documentElement;h.classList.add("js");
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
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled: isDraftMode } = await draftMode();
  const { data } = await cachedSanity({ query: SETTINGS_QUERY, perspective: "published", stega: false });
  const settings = data as SiteSettings;

  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preflight }} />
      </head>
      <body>
        <IntroLoader />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader settings={settings} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter settings={settings} />
        <RevealObserver />
        <SanityLive includeDrafts={isDraftMode} />
        {isDraftMode && <VisualEditing />}
      </body>
    </html>
  );
}
