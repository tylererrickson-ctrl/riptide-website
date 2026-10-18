/**
 * Generates Riptide's original banner artwork (replaces Wix-era stock/unknown-licence images).
 * Abstract flowing contour lines in the brand palette, rendered on a canvas in headless Chromium.
 * Fully original — produced by this script, so Riptide owns it outright.
 *
 *   node scripts/generate-artwork.mjs [outDir]
 *
 * Needs Playwright + Chromium (PLAYWRIGHT_CHROMIUM or the default Playwright install).
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const outDir = process.argv[2] || "public/images/art";
mkdirSync(outDir, { recursive: true });

// Brand palette (see src/app/(site)/globals.css): navy/abyss background, logo blues for lines.
const VARIANTS = [
  { name: "riptide-art-home", seed: 7, lines: 64, amp: 0.2, freq: 1.6, tilt: -0.12, glow: [0.72, 0.35], hue: ["#1c81be", "#75c1e0"] },
  { name: "riptide-art-investors", seed: 21, lines: 56, amp: 0.26, freq: 1.2, tilt: 0.08, glow: [0.25, 0.6], hue: ["#2596be", "#9fd6ec"] },
  { name: "riptide-art-managers", seed: 42, lines: 60, amp: 0.17, freq: 2.1, tilt: -0.05, glow: [0.6, 0.7], hue: ["#1c81be", "#a8dcef"] },
];

const W = 2400, H = 1350;

const html = (v) => `<!doctype html><html><body style="margin:0;background:#06131f">
<canvas id="c" width="${W}" height="${H}"></canvas>
<script>
const v = ${JSON.stringify(v)};
const c = document.getElementById("c"), g = c.getContext("2d");
let s = v.seed; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
// Smooth value noise
const P = Array.from({ length: 512 }, rnd);
const noise = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return P[i & 511] * (1 - u) + P[(i + 1) & 511] * u; };
// Background: deep navy with a soft brand glow
const bg = g.createLinearGradient(0, 0, ${W}, ${H});
bg.addColorStop(0, "#0b2e4f"); bg.addColorStop(0.55, "#071a2c"); bg.addColorStop(1, "#04101b");
g.fillStyle = bg; g.fillRect(0, 0, ${W}, ${H});
const gl = g.createRadialGradient(${W} * v.glow[0], ${H} * v.glow[1], 0, ${W} * v.glow[0], ${H} * v.glow[1], ${W} * 0.55);
gl.addColorStop(0, "rgba(28,129,190,0.35)"); gl.addColorStop(1, "rgba(28,129,190,0)");
g.fillStyle = gl; g.fillRect(0, 0, ${W}, ${H});
// Flowing contour lines
for (let k = 0; k < v.lines; k++) {
  const t = k / (v.lines - 1);
  const y0 = -0.15 * ${H} + t * 1.3 * ${H};
  const grad = g.createLinearGradient(0, 0, ${W}, 0);
  grad.addColorStop(0, v.hue[0]); grad.addColorStop(1, v.hue[1]);
  g.strokeStyle = grad;
  g.globalAlpha = 0.10 + 0.32 * Math.pow(Math.sin(Math.PI * t), 1.5);
  g.lineWidth = 1.3 + 1.2 * Math.sin(Math.PI * t);
  g.beginPath();
  for (let x = -40; x <= ${W} + 40; x += 8) {
    const nx = x / ${W};
    const wave = Math.sin(nx * Math.PI * v.freq + t * 5.2) * v.amp * ${H} * (0.35 + 0.65 * Math.sin(Math.PI * t));
    const drift = (noise(nx * 3.1 + t * 2.3) - 0.5) * v.amp * ${H} * 0.9;
    const y = y0 + wave + drift + (nx - 0.5) * v.tilt * ${H};
    x === -40 ? g.moveTo(x, y) : g.lineTo(x, y);
  }
  g.stroke();
}
// Gentle vignette so overlaid text keeps contrast at the edges
g.globalAlpha = 1;
const vg = g.createRadialGradient(${W} / 2, ${H} / 2, ${H} * 0.4, ${W} / 2, ${H} / 2, ${W} * 0.75);
vg.addColorStop(0, "rgba(4,16,27,0)"); vg.addColorStop(1, "rgba(4,16,27,0.55)");
g.fillStyle = vg; g.fillRect(0, 0, ${W}, ${H});
c.dataset.done = "1";
</script></body></html>`;

const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {});
for (const v of VARIANTS) {
  const page = await browser.newPage({ viewport: { width: W, height: H } }); // fresh page per variant
  await page.setContent(html(v));
  await page.waitForFunction(() => document.getElementById("c").dataset.done === "1");
  const file = path.join(outDir, `${v.name}.jpg`);
  await page.locator("#c").screenshot({ path: file, type: "jpeg", quality: 86 });
  console.log("wrote", file);
  await page.close();
}
await browser.close();
