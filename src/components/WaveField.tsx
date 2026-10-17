"use client";

import { useEffect, useRef } from "react";

/**
 * Riptide's signature visual: layered current lines that drift like a swell and
 * lift toward the pointer. Canvas 2D, DPR-aware, pauses offscreen and in hidden tabs,
 * draws a single still frame for prefers-reduced-motion. Decorative (aria-hidden).
 */
type Props = {
  className?: string;
  lines?: number;
  /** "contour" stacks lines top-to-bottom; "vortex" bends them around a center (echoes the logo mark). */
  variant?: "contour" | "vortex";
  /** Read colors from CSS custom properties on the canvas (so they follow theme/tone). */
  colorVars?: [string, string];
  intensity?: number;
};

const DEFAULT_COLOR_VARS: [string, string] = ["--wave-a", "--wave-b"];

export function WaveField({
  className,
  lines = 34,
  variant = "contour",
  colorVars = DEFAULT_COLOR_VARS,
  intensity = 1,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let running = false;
    let visible = true;
    const pointer = { x: -1, y: -1, tx: -1, ty: -1, strength: 0, target: 0 };
    let colors: [string, string] = ["#1c81be", "#75c1e0"];

    const readColors = () => {
      const cs = getComputedStyle(canvas);
      colors = [cs.getPropertyValue(colorVars[0]).trim() || colors[0], cs.getPropertyValue(colorVars[1]).trim() || colors[1]];
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readColors();
      if (!running) draw(performance.now());
    };

    const draw = (t: number) => {
      const time = t / 1000;
      ctx.clearRect(0, 0, w, h);
      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;
      pointer.strength += (pointer.target - pointer.strength) * 0.05;
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, colors[0]);
      grad.addColorStop(1, colors[1]);
      ctx.strokeStyle = grad;
      const step = Math.max(6, w / 140);

      for (let i = 0; i < lines; i++) {
        const f = i / (lines - 1);
        ctx.globalAlpha = (0.12 + 0.5 * Math.sin(Math.PI * f)) * intensity;
        ctx.lineWidth = 0.8 + 0.6 * Math.sin(Math.PI * f);
        ctx.beginPath();
        if (variant === "contour") {
          const baseY = h * (0.08 + 0.84 * f);
          for (let x = -step; x <= w + step; x += step) {
            const nx = x / w;
            let y =
              baseY +
              Math.sin(nx * 6.2 + time * 0.35 + f * 4.0) * h * 0.035 +
              Math.sin(nx * 13.0 - time * 0.22 + f * 9.0) * h * 0.012 +
              Math.sin(nx * 2.1 + time * 0.12) * h * 0.05 * f;
            if (pointer.strength > 0.001) {
              const dx = x - pointer.x;
              const dy = baseY - pointer.y;
              const d2 = (dx * dx) / (w * w * 0.02) + (dy * dy) / (h * h * 0.03);
              y -= Math.exp(-d2) * h * 0.06 * pointer.strength;
            }
            if (x === -step) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        } else {
          // Vortex: concentric, slightly eccentric loops that open into a curl.
          const cx = w * 0.5 + (pointer.strength > 0.001 ? (pointer.x - w * 0.5) * 0.06 * pointer.strength : 0);
          const cy = h * 0.5 + (pointer.strength > 0.001 ? (pointer.y - h * 0.5) * 0.06 * pointer.strength : 0);
          const R = Math.min(w, h) * (0.12 + 0.36 * f);
          const turns = 0.86 + 0.1 * Math.sin(time * 0.3 + f * 3);
          const start = time * 0.12 + f * 2.4;
          for (let a = 0; a <= Math.PI * 2 * turns; a += 0.04) {
            const k = a / (Math.PI * 2);
            const r = R * (1 - 0.18 * k) + Math.sin(a * 3 + time * 0.6 + f * 6) * R * 0.025;
            const x = cx + Math.cos(a + start) * r;
            const y = cy + Math.sin(a + start) * r * 0.92;
            if (a === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    // Phones / coarse pointers: 30 fps is plenty for a slow swell and halves the work.
    const frameMs = matchMedia("(pointer: coarse), (max-width: 700px)").matches ? 1000 / 30 : 0;
    let last = 0;
    const loop = (t: number) => {
      if (!frameMs || t - last >= frameMs) {
        last = t;
        draw(t);
      }
      raf = requestAnimationFrame(loop);
    };
    let ready = false; // animation starts once the page is idle, so it never competes with hydration
    const start = () => {
      if (running || !ready || reduced || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.tx = e.clientX - r.left;
      pointer.ty = e.clientY - r.top;
      if (pointer.x < 0) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
      pointer.target = 1;
    };
    const onLeave = () => {
      pointer.target = 0;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    const host = canvas.parentElement ?? canvas;
    host.addEventListener("pointermove", onPointer);
    host.addEventListener("pointerleave", onLeave);
    // Re-read colors when the theme changes.
    const mo = new MutationObserver(() => {
      readColors();
      if (!running) draw(performance.now());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    resize(); // first (still) frame immediately
    const begin = () => {
      ready = true;
      start();
    };
    const hasIdle = "requestIdleCallback" in window;
    const idleId = hasIdle ? window.requestIdleCallback(begin, { timeout: 2500 }) : window.setTimeout(begin, 1200);
    return () => {
      if (hasIdle) window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
      stop();
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      host.removeEventListener("pointermove", onPointer);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [lines, variant, colorVars, intensity]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
