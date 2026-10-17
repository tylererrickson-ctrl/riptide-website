import Image from "next/image";
import { PortableText } from "next-sanity";
import type { SiteSettings } from "@/sanity/types";
import { SmartLink } from "./SmartLink";
import { DisclaimerReopenButton } from "./DisclaimerGate";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = 2026; // Phase 3: render the year at request time without breaking the static shell
  return (
    <footer className="site-footer" data-tone="dark">
      <div className="footer-grid">
        <div>
          <Image src="/images/logo-horizontal-white.png" alt="Riptide Advisors" width={220} height={75} />
          {settings?.footerTagline && <p>{settings.footerTagline}</p>}
        </div>
        {!!settings?.footerNav?.length && (
          <nav aria-label="Footer">
            <p className="micro">Pages</p>
            <ul>
              {settings.footerNav.map((l) =>
                l.href && l.label ? (
                  <li key={l.href}>
                    <SmartLink href={l.href}>{l.label}</SmartLink>
                  </li>
                ) : null,
              )}
            </ul>
          </nav>
        )}
        <address>
          <p className="micro">Contact</p>
          {settings?.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
          {settings?.addressLines?.map((l) => <span key={l}>{l}</span>)}
          {settings?.linkedin && (
            <SmartLink href={settings.linkedin}>LinkedIn</SmartLink>
          )}
        </address>
      </div>
      {settings?.footerDisclosure && (
        <div className="footer-disclosure">
          <PortableText value={settings.footerDisclosure} />
        </div>
      )}
      <div className="footer-legal">
        <span>
          © {year} {settings?.siteName ?? "Riptide Advisors"}
        </span>
        <ul>
          {settings?.legalLinks?.map((l) =>
            l.href && l.label ? (
              <li key={l.href}>
                <SmartLink href={l.href}>{l.label}</SmartLink>
              </li>
            ) : null,
          )}
          {settings?.siteDisclaimer && (
            <li>
              <DisclaimerReopenButton disclaimer={settings.siteDisclaimer} />
            </li>
          )}
        </ul>
      </div>
    </footer>
  );
}
