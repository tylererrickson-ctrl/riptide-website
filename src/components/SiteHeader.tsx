import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/sanity/types";
import { SmartLink } from "./SmartLink";

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  return (
    <header className="site-header">
      <Link href="/" className="site-logo" aria-label={`${settings?.siteName ?? "Riptide Advisors"} home`}>
        <Image src="/images/logo-horizontal-color.png" alt="" width={231} height={78} priority />
      </Link>
      <nav aria-label="Main">
        <ul>
          {settings?.mainNav?.map((l) =>
            l.href && l.label ? (
              <li key={l.href}>
                <SmartLink href={l.href}>{l.label}</SmartLink>
              </li>
            ) : null,
          )}
        </ul>
      </nav>
      {settings?.headerCta?.href && settings.headerCta.label && (
        <SmartLink href={settings.headerCta.href} className="bracket">
          <span>{settings.headerCta.label}</span>
        </SmartLink>
      )}
    </header>
  );
}
