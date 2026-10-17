/**
 * Maximum Leverage Calculator — math ported verbatim from Riptide's original
 * Wix HTML embed (content/risk.leverage-calculator.html). Do not change formulas
 * without a review from the risk team.
 */

export type Dist = "normal" | "t";
export type Mode = "end" | "path";

export type Inputs = {
  vol: number; // annualized volatility, %
  conf: number; // confidence level, %
  days: number; // horizon, trading days
  loss: number; // max acceptable equity loss, %
  dist: Dist;
  df: number; // Student-t degrees of freedom
  mode: Mode; // breach definition
  drift: boolean;
  driftVal: number; // expected annual return, %
};

export const DEFAULTS: Inputs = { vol: 15, conf: 99, days: 10, loss: 25, dist: "normal", df: 5, mode: "path", drift: false, driftVal: 8 };

type P = { vol: number; conf: number; days: number; loss: number; dist: Dist; df: number; mode: Mode; drift: boolean; driftVal: number };

/** Acklam's inverse-normal approximation. */
export function normInv(p: number): number {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const pl = 0.02425;
  const ph = 1 - pl;
  let q: number;
  let r: number;
  if (p < pl) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p <= ph) {
    q = p - 0.5;
    r = q * q;
    return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

/** Cornish-Fisher style expansion of the Student-t quantile. */
export function tInv(p: number, df: number): number {
  const z = normInv(p);
  const z3 = z ** 3;
  const z5 = z ** 5;
  const z7 = z ** 7;
  return z + (z3 + z) / (4 * df) + (5 * z5 + 16 * z3 + 3 * z) / (96 * df * df) + (3 * z7 + 19 * z5 + 17 * z3 - 15 * z) / (384 * df ** 3);
}

export function shock(conf: number, dist: Dist, df: number): number {
  return dist === "t" ? tInv(conf, df) * Math.sqrt((df - 2) / df) : normInv(conf);
}

export function toParams(s: Inputs): P {
  return { vol: s.vol / 100, conf: s.conf / 100, days: s.days, loss: s.loss / 100, dist: s.dist, df: s.df, mode: s.mode, drift: s.drift, driftVal: s.driftVal / 100 };
}

export function breakdown(p: P) {
  const sd = p.vol / Math.sqrt(252);
  const hv = sd * Math.sqrt(p.days);
  // path mode: reflection principle -> P(min < -B) ~ 2*P(end < -B); size endpoint to (1+conf)/2
  const effConf = p.mode === "path" ? (1 + p.conf) / 2 : p.conf;
  const q = shock(effConf, p.dist, p.df);
  const drift = p.drift ? (p.driftVal / 252) * p.days : 0;
  const uvar = q * hv - drift;
  return { sd, hv, q, uvar };
}

export function maxLev(p: P): number {
  const { uvar } = breakdown(p);
  return uvar <= 0 ? Infinity : p.loss / uvar;
}

export const fmt = (x: number, d = 2) =>
  Number.isFinite(x) ? x.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d }) : "∞";
