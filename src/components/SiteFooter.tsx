import Image from "next/image";
import { PortableText } from "next-sanity";
import type { SiteSettings } from "@/sanity/types";
import { SmartLink } from "./SmartLink";
import { DisclaimerReopenButton } from "./DisclaimerGate";
import { ptComponents } from "./sections/shared";
import { FooterYear } from "./FooterYear";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const name = settings?.siteName ?? "Riptide Advisors";
  return (
    <footer className="site-footer" data-tone="dark">
      <div className="footer-grid">
        <div>
          <p className="micro">{name}</p>
          {settings?.footerTagline && <p className="footer-tagline">{settings.footerTagline}</p>}
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
        <div>
          <p className="micro">Contact</p>
          <address>
            {settings?.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
            {settings?.addressLines?.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </address>
        </div>
        <div>
          <p className="micro">Follow</p>
          <ul>
            {settings?.linkedin && (
              <li>
                <SmartLink href={settings.linkedin}>LinkedIn</SmartLink>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="footer-wordmark">
        <Image src="/images/logo-horizontal-white.png" alt={name} width={1103} height={374} sizes="(min-width: 900px) 520px, 70vw" />
      </div>

      {!!settings?.footerDisclosure?.length && (
        <div className="footer-disclosure">
          <PortableText value={settings.footerDisclosure} components={ptComponents} />
        </div>
      )}

      <div className="footer-legal micro">
        <span>
          © <FooterYear /> {name} LLC. All rights reserved.
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
        <span>{settings?.locationShort}</span>
      </div>
    </footer>
  );
}
