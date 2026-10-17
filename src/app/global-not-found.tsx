import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { fontVars } from "./fonts";
import "./(site)/globals.css";

export const metadata: Metadata = {
  title: "Page not found | Riptide Advisors",
  robots: { index: false, follow: true },
};

const theme = `(function(){try{var t=localStorage.getItem("rt-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})();`;

/** Served (with HTTP 404) for any URL that isn't a route or a published CMS page. */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: theme }} />
      </head>
      <body>
        <header className="site-header" data-solid="true">
          <Link href="/" className="site-logo" aria-label="Riptide Advisors home">
            <Image className="logo-img logo-light" src="/images/logo-horizontal-color.png" alt="" width={1103} height={374} priority />
            <Image className="logo-img logo-dark" src="/images/logo-horizontal-white.png" alt="" width={1103} height={374} priority />
          </Link>
        </header>
        <main id="main">
          <section className="section not-found">
            <p className="micro">Error 404</p>
            <h1>Page not found</h1>
            <p className="lead">The page you were looking for has moved or no longer exists.</p>
            <p>
              <Link href="/" className="bracket bracket-accent">
                <span>Back to home</span>
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </p>
          </section>
        </main>
      </body>
    </html>
  );
}
