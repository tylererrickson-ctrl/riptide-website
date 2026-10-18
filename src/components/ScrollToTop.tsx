"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Every page opens at the top (Tyler, 2026-10-18). The router alone kept the previous scroll offset when
 * a link was clicked low on a page (e.g. footer links landed thousands of px down). Links to an anchor
 * (#section) are left alone so they still jump to that section. Reload restoration is turned off in the
 * layout's preflight script (history.scrollRestoration = "manual").
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      if (!location.hash) window.scrollTo(0, 0);
      return;
    }
    if (location.hash) return;
    window.scrollTo(0, 0);
    // Content can stream in just after the route commits; settle once more on the next frame.
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, [pathname]);
  return null;
}
