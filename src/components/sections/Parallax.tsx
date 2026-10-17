"use client";

import { useEffect, useRef } from "react";

/** Subtle pointer + scroll parallax for background media. Writes transforms directly (no re-renders). */
export function Parallax({ className, children, depth = 18 }: { className?: string; children: React.ReactNode; depth?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    const tick = () => {
      px += (tx - px) * 0.06;
      py += (ty - py) * 0.06;
      const sy = Math.min(window.scrollY, window.innerHeight) * 0.18;
      el.style.transform = `translate3d(${px * depth}px, ${py * depth + sy}px, 0) scale(1.04)`;
      raf = Math.abs(tx - px) + Math.abs(ty - py) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      kick();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", kick, { passive: true });
    kick();
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", kick);
      cancelAnimationFrame(raf);
    };
  }, [depth]);
  return (
    <div ref={ref} className={className} aria-hidden="true">
      {children}
    </div>
  );
}
