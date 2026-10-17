"use client";

import { useId, useState } from "react";
import { DEFAULTS, breakdown, fmt, maxLev, toParams, type Dist, type Inputs, type Mode } from "./leverage";

/**
 * Maximum Leverage Calculator (React port of Riptide's original Wix HTML embed).
 * Copy is verbatim from the original except the endpoint label, which now follows the
 * selected horizon ("Endpoint (10-day close)") instead of the hard-coded "5-day".
 */

type NumKey = "vol" | "conf" | "days" | "loss" | "df" | "driftVal";
const RANGES: Record<NumKey, { min: number; max: number; step: number }> = {
  vol: { min: 1, max: 80, step: 0.5 },
  conf: { min: 80, max: 99.9, step: 0.1 },
  days: { min: 1, max: 21, step: 1 },
  loss: { min: 5, max: 90, step: 1 },
  df: { min: 4, max: 30, step: 1 },
  driftVal: { min: -20, max: 40, step: 0.5 },
};

function NumberField({
  label,
  unit,
  k,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  k: NumKey;
  value: number;
  onChange: (k: NumKey, v: number) => void;
}) {
  const id = useId();
  const r = RANGES[k];
  const set = (raw: string) => {
    const v = Number(raw);
    if (raw !== "" && Number.isFinite(v)) onChange(k, Math.min(r.max, Math.max(r.min, v)));
  };
  return (
    <div className="calc-field">
      <div className="calc-field-head">
        <label htmlFor={`${id}-n`}>{label}</label>
        <span className="calc-num">
          <input id={`${id}-n`} type="number" inputMode="decimal" min={r.min} max={r.max} step={r.step} value={value} onChange={(e) => set(e.target.value)} />
          <span aria-hidden="true">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={r.min}
        max={r.max}
        step={r.step}
        value={value}
        aria-label={`${label} slider`}
        aria-valuetext={`${value} ${unit}`}
        onChange={(e) => set(e.target.value)}
      />
    </div>
  );
}

function Segmented<T extends string | boolean>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const id = useId();
  return (
    <div className="calc-field">
      <div className="calc-field-head">
        <span className="label" id={id}>
          {label}
        </span>
        <div className="seg" role="group" aria-labelledby={id}>
          {options.map((o) => (
            <button key={String(o.value)} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Frontier({ s, current }: { s: Inputs; current: number }) {
  const W = 560;
  const H = 300;
  const pl = 52;
  const pr = 16;
  const pt = 16;
  const pb = 40;
  const p = toParams(s);
  const pts: { v: number; L: number }[] = [];
  for (let v = 0.05; v <= 0.6001; v += 0.005) pts.push({ v, L: maxLev({ ...p, vol: v }) });
  const maxL = Math.min(60, Math.max(...pts.map((o) => (Number.isFinite(o.L) ? o.L : 0)), current * 1.2, 5));
  const x = (v: number) => pl + ((v - 0.05) / 0.55) * (W - pl - pr);
  const y = (L: number) => H - pb - (Math.min(L, maxL) / maxL) * (H - pt - pb);
  const path = pts.map((o, i) => `${i ? "L" : "M"}${x(o.v).toFixed(1)},${y(o.L).toFixed(1)}`).join(" ");
  const area = `${path} L${x(0.6)},${H - pb} L${x(0.05)},${H - pb} Z`;
  const cx = x(Math.min(Math.max(p.vol, 0.05), 0.6));
  const cy = y(current);
  const gid = useId().replace(/:/g, "");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Maximum leverage versus portfolio volatility. At ${s.vol}% volatility: ${fmt(current, 1)}x.`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const t = f * maxL;
        return (
          <g key={f}>
            <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="var(--line)" />
            <text x={pl - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--ink-muted)">
              {fmt(t, 0)}x
            </text>
          </g>
        );
      })}
      {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6].map((t) => (
        <text key={t} x={x(t)} y={H - pb + 18} textAnchor="middle" fontSize="11" fill="var(--ink-muted)">
          {Math.round(t * 100)}%
        </text>
      ))}
      <text x={(pl + W - pr) / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--ink-muted)">
        Annualized volatility
      </text>
      <path d={area} fill={`url(#${gid})`} />
      <path d={path} fill="none" stroke="var(--brand)" strokeWidth="2.5" />
      <line x1={cx} x2={cx} y1={cy} y2={H - pb} stroke="var(--accent)" strokeDasharray="3 4" />
      <circle cx={cx} cy={cy} r="6" fill="var(--ink)" stroke="var(--surface)" strokeWidth="2" />
      <text x={cx + 10} y={cy - 8} fontSize="12" fontWeight="700" fill="var(--ink)">
        {fmt(current, 1)}x
      </text>
    </svg>
  );
}

export function LeverageCalculator() {
  const [s, setS] = useState<Inputs>(DEFAULTS);
  const setNum = (k: NumKey, v: number) => setS((prev) => ({ ...prev, [k]: v }));
  const p = toParams(s);
  const L = maxLev(p);
  const { sd, hv, q, uvar } = breakdown(p);
  const confRows = [90, 95, 99, 99.5].map((c) => ({ c, l: maxLev({ ...p, conf: c / 100 }) }));

  return (
    <div className="calc">
      <div className="stack">
        <p className="muted">
          Solves for the largest gross leverage such that, at your chosen confidence level, the equity loss does not breach the limit over the
          horizon. Loss tolerance is measured against <strong>equity capital at inception leverage</strong>.
        </p>
        <div className="calc-panel">
          <h2>Inputs</h2>
          <NumberField label="Annualized volatility" unit="%" k="vol" value={s.vol} onChange={setNum} />
          <NumberField label="Confidence level" unit="%" k="conf" value={s.conf} onChange={setNum} />
          <NumberField label="Horizon" unit="days" k="days" value={s.days} onChange={setNum} />
          <NumberField label="Max acceptable equity loss" unit="%" k="loss" value={s.loss} onChange={setNum} />
          <Segmented<Dist>
            label="Return distribution"
            value={s.dist}
            onChange={(v) => setS((x) => ({ ...x, dist: v }))}
            options={[
              { value: "normal", label: "Normal" },
              { value: "t", label: "Student-t (fat tails)" },
            ]}
          />
          {s.dist === "t" && <NumberField label="Degrees of freedom" unit="ν" k="df" value={s.df} onChange={setNum} />}
          <Segmented<Mode>
            label="Breach definition"
            value={s.mode}
            onChange={(v) => setS((x) => ({ ...x, mode: v }))}
            options={[
              { value: "end", label: `Endpoint (${s.days}-day close)` },
              { value: "path", label: "Any point in window" },
            ]}
          />
          <Segmented<boolean>
            label="Include expected drift"
            value={s.drift}
            onChange={(v) => setS((x) => ({ ...x, drift: v }))}
            options={[
              { value: false, label: "Off (conservative)" },
              { value: true, label: "On" },
            ]}
          />
          {s.drift && <NumberField label="Expected annual return" unit="%" k="driftVal" value={s.driftVal} onChange={setNum} />}
        </div>
      </div>

      <div className="calc-right">
        <div className="calc-panel calc-result" aria-live="polite">
          <h2>Maximum gross leverage</h2>
          <p className="calc-big">
            {fmt(L, 2)}
            <small>x</small>
          </p>
          <p className="calc-explain">
            At {fmt(L, 2)}x, the {s.conf}% worst-case {s.days}-day {s.mode === "path" ? "running-maximum" : "endpoint"} equity loss equals your{" "}
            {s.loss}% limit. Beyond this, the probability of breaching {s.loss}% exceeds {fmt(100 - s.conf, 1)}%.
          </p>
          <dl className="calc-stats">
            {(
              [
                ["Daily vol (unlevered)", `${fmt(sd * 100, 2)}%`],
                [`${s.days}-day vol (unlevered)`, `${fmt(hv * 100, 2)}%`],
                [`${s.days}-day vol at max leverage`, `${fmt(L * hv * 100, 1)}%`],
                [`Quantile shock (z${s.mode === "path" ? ", path-adj" : ""})`, fmt(q, 3)],
                [`Unlevered VaR (${s.days}d)`, `${fmt(uvar * 100, 2)}%`],
              ] as const
            ).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="calc-panel calc-chart">
          <h2>Leverage frontier</h2>
          <p className="micro" style={{ marginBottom: 12 }}>
            Shaded region = leverage/vol combinations inside the loss limit
          </p>
          <Frontier s={s} current={L} />
        </div>

        <div className="calc-panel">
          <h2>Sensitivity to confidence level</h2>
          <table className="calc-table">
            <thead>
              <tr>
                <th scope="col">Confidence</th>
                <th scope="col">Max leverage</th>
              </tr>
            </thead>
            <tbody>
              {confRows.map(({ c, l }) => (
                <tr key={c} data-current={c === s.conf}>
                  <td>{c}%</td>
                  <td>{fmt(l, 2)}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="calc-panel">
          <h2>Model caveats</h2>
          <ol className="calc-caveats">
            <li>
              Parametric VaR assumes i.i.d. returns and √t scaling — realized tails, vol clustering, and gap risk can be materially worse. The
              Student-t toggle is a partial correction.
            </li>
            <li>
              Loss tolerance is equity loss at <strong>inception</strong> leverage. Effective leverage rises as equity erodes mid-drawdown; the
              model assumes no re-levering spiral and no forced deleveraging.
            </li>
            <li>
              &quot;Any point in window&quot; mode uses the reflection principle (breach probability ≈ 2× endpoint probability for a driftless
              walk) — this is the honest constraint if margin triggers bind intraweek.
            </li>
            <li>
              A breach probability per window compounds across repeated windows — over a year of independent windows the chance of at least one
              breach is far higher.
            </li>
            <li>Ignores financing costs, margin haircut changes, and volatility estimation error entering regime shifts.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
