"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { SiteSettings } from "@/sanity/types";
import { SmartLink } from "./SmartLink";
import { ThemeToggle } from "./ThemeToggle";

const subscribeScroll = (cb: () => void) => {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
};

/**
 * Fixed header: transparent over the page top, solid once scrolled. Over a dark hero
 * (any `[data-hero-dark]` in <main>) it switches to light-on-dark via CSS :has().
 * Desktop shows inline nav; the "Menu" button opens a full-screen, focus-trapped overlay.
 */
/** Reads the URL (needs a Suspense boundary under Cache Components). */
export function SiteHeaderWithPath({ settings }: { settings: SiteSettings }) {
  return <SiteHeader settings={settings} pathname={usePathname()} />;
}

/** Renders with or without a known pathname (the latter is the prerender fallback). */
export function SiteHeader({ settings, pathname = null }: { settings: SiteSettings; pathname?: string | null }) {
  const solid = useSyncExternalStore(subscribeScroll, () => window.scrollY > 24, () => false);
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  const menuId = useId();
  const overlayRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const nav = settings?.mainNav?.filter((l) => l.href && l.label) ?? [];

  // Close the menu when the route changes (derived during render, no effect needed).
  if (open && openedAt !== pathname) {
    setOpen(false);
    setOpenedAt(pathname);
  }

  useEffect(() => {
    const el = overlayRef.current;
    if (!open || !el) return;
    const siblings = Array.from(document.body.children).filter(
      (n): n is HTMLElement => n instanceof HTMLElement && !n.contains(el),
    );
    siblings.forEach((n) => n.setAttribute("inert", ""));
    document.documentElement.style.overflow = "hidden";
    el.querySelector<HTMLElement>("nav a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key !== "Tab") return;
      const f = el.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const button = buttonRef.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      siblings.forEach((n) => n.removeAttribute("inert"));
      document.documentElement.style.overflow = "";
      button?.focus();
    };
  }, [open]);

  const current = (href: string) => (pathname && href === pathname ? "page" : undefined);
  const name = settings?.siteName ?? "Riptide Advisors";

  return (
    <>
      <header className="site-header" data-solid={solid}>
        <Link href="/" className="site-logo" aria-label={`${name} home`}>
          <Image className="logo-img logo-light" src="/images/logo-horizontal-color.png" alt="" width={1103} height={374} priority />
          <Image className="logo-img logo-dark" src="/images/logo-horizontal-white.png" alt="" width={1103} height={374} priority />
        </Link>
        <nav className="site-nav" aria-label="Main">
          <ul>
            {nav.map((l) => (
              <li key={l.href}>
                <SmartLink href={l.href!} aria-current={current(l.href!)}>
                  {l.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="header-actions">
          {settings?.headerCta?.href && settings.headerCta.label && (
            <SmartLink href={settings.headerCta.href} className="bracket bracket-accent header-cta">
              <span>{settings.headerCta.label}</span>
            </SmartLink>
          )}
          <ThemeToggle />
          <button
            ref={buttonRef}
            type="button"
            className="menu-button"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => {
              setOpenedAt(pathname);
              setOpen(true);
            }}
          >
            <span>Menu</span>
            <span className="bars" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div
        ref={overlayRef}
        id={menuId}
        className="menu-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!open}
      >
        <div className="menu-overlay-top">
          <span className="micro">{name}</span>
          <button type="button" className="bracket" onClick={() => setOpen(false)}>
            <span>Close</span>
          </button>
        </div>
        <nav aria-label="Menu">
          <ol>
            <li>
              <Link href="/" aria-current={current("/")}>
                Home
              </Link>
            </li>
            {nav.map((l) => (
              <li key={l.href}>
                <SmartLink href={l.href!} aria-current={current(l.href!)}>
                  {l.label}
                </SmartLink>
              </li>
            ))}
            {settings?.headerCta?.href && settings.headerCta.label && (
              <li>
                <SmartLink href={settings.headerCta.href}>{settings.headerCta.label}</SmartLink>
              </li>
            )}
          </ol>
        </nav>
        <div className="menu-overlay-foot micro">
          {settings?.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
          {settings?.locationShort && <span>{settings.locationShort}</span>}
        </div>
      </div>
    </>
  );
}
