"use client";

import { useEffect } from "react";

/**
 * One IntersectionObserver for every [data-reveal] element, for the life of the page.
 *
 * Page content streams in after this component mounts (it sits inside <Suspense>, and on client-side
 * navigation the new route's sections arrive after the URL changes), so a one-off scan at mount
 * misses them and they stay at opacity 0 — the "page doesn't fully populate" bug seen on /rof when
 * reached via a link. A MutationObserver picks up every [data-reveal] element whenever it is added.
 */
export function RevealObserver() {
  useEffect(() => {
    const reduce = !("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches;
    const show = (el: Element) => el.setAttribute("data-visible", "true");

    const io = reduce
      ? null
      : new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (e.isIntersecting) {
                show(e.target);
                io?.unobserve(e.target);
              }
            }
          },
          { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
        );

    const seen = new WeakSet<Element>();
    const scan = (root: ParentNode) => {
      const found: Element[] = [];
      if (root instanceof Element && root.matches("[data-reveal]")) found.push(root);
      root.querySelectorAll?.("[data-reveal]").forEach((el) => found.push(el));
      for (const el of found) {
        if (seen.has(el) || el.getAttribute("data-visible") === "true") continue;
        seen.add(el);
        if (io) io.observe(el);
        else show(el);
      }
    };

    scan(document);
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => n.nodeType === 1 && scan(n as Element));
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io?.disconnect();
    };
  }, []);
  return null;
}
