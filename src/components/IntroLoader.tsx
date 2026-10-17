"use client";

import { useEffect } from "react";

/**
 * Once-per-session intro: dark screen with the Riptide mark, then a wipe.
 * CSS-only animation; hidden before paint when the session flag is set (see layout preflight),
 * and skipped entirely for prefers-reduced-motion.
 */
export function IntroLoader() {
  useEffect(() => {
    try {
      sessionStorage.setItem("rt-intro", "1");
    } catch {
      /* storage blocked */
    }
  }, []);
  return (
    <div className="intro" aria-hidden="true" suppressHydrationWarning>
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny, above-the-fold, no layout shift */}
      <img src="/images/logo-mark.png" alt="" width={64} height={64} />
      <span className="micro">Riptide Advisors · Greenwich, CT</span>
    </div>
  );
}
