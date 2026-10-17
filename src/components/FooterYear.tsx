"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};
// Build year as the server snapshot keeps the static shell cacheable; the client shows the live year.
const BUILD_YEAR = Number(process.env.NEXT_PUBLIC_BUILD_YEAR) || 2026;

export function FooterYear() {
  const year = useSyncExternalStore(noop, () => new Date().getFullYear(), () => BUILD_YEAR);
  return <span suppressHydrationWarning>{year}</span>;
}
