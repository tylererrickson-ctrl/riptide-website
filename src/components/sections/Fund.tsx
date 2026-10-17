import type { Section } from "@/sanity/types";
import { Heading, Shell } from "./shared";

type Of<T extends Section["_type"]> = Extract<Section, { _type: T }>;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pct = (v: number | undefined | null, digits = 2) =>
  v == null || Number.isNaN(v) ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(digits)}`;
const sign = (v: number | undefined | null) => (v == null ? undefined : v > 0 ? "pos" : v < 0 ? "neg" : undefined);

export function KeyFacts({ s, first }: { s: Of<"keyFacts">; first: boolean }) {
  const facts = s.facts ?? [];
  const big = facts.filter((f) => f.emphasis);
  const rest = facts.filter((f) => !f.emphasis);
  return (
    <Shell s={s}>
      {s.heading && (
        <Heading first={first} className="explainer-heading">
          {s.heading}
        </Heading>
      )}
      {!!big.length && (
        <dl className="fact-stats" data-reveal>
          {big.map((f) => (
            <div key={f._key}>
              <dt className="micro">{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {!!rest.length && (
        <dl className="fact-grid" data-reveal>
          {rest.map((f) => (
            <div key={f._key}>
              <dt className="micro">{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {s.note && <p className="micro" style={{ marginTop: 16 }}>{s.note}</p>}
    </Shell>
  );
}

/** Growth of $1,000 from monthly returns, chronologically across all years entered. */
function growthSeries(years: NonNullable<Of<"fundPerformance">["years"]>, key: "fund" | "benchmark") {
  const sorted = [...years].sort((a, b) => a.year - b.year);
  const pts: { label: string; value: number }[] = [];
  let v = 1000;
  for (const y of sorted) {
    const arr = y[key] ?? [];
    if (!pts.length && arr.length) pts.push({ label: `Start ${y.year}`, value: v });
    arr.forEach((r, i) => {
      if (r == null || Number.isNaN(r)) return;
      v *= 1 + r / 100;
      pts.push({ label: `${MONTHS[i]} ${y.year}`, value: v });
    });
  }
  return pts;
}

function GrowthChart({ s }: { s: Of<"fundPerformance"> }) {
  const years = s.years ?? [];
  const fund = growthSeries(years, "fund");
  const bench = s.benchmarkLabel ? growthSeries(years, "benchmark") : [];
  if (fund.length < 2) return null;
  const W = 760;
  const H = 320;
  const pl = 56;
  const pr = 96;
  const pt = 20;
  const pb = 36;
  const all = [...fund, ...bench].map((p) => p.value);
  const lo = Math.floor(Math.min(...all) / 20) * 20 - 20;
  const hi = Math.ceil(Math.max(...all) / 20) * 20 + 20;
  const n = Math.max(fund.length, bench.length);
  const x = (i: number) => pl + (i / (n - 1)) * (W - pl - pr);
  const y = (v: number) => pt + (1 - (v - lo) / (hi - lo)) * (H - pt - pb);
  const path = (pts: { value: number }[]) => pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const ticks: number[] = [];
  const step = (hi - lo) / 4;
  for (let t = lo; t <= hi + 0.01; t += step) ticks.push(Math.round(t));
  const lastF = fund[fund.length - 1];
  const lastB = bench[bench.length - 1];
  const money = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;
  // keep end labels from colliding
  let fy = y(lastF.value);
  let by = lastB ? y(lastB.value) : 0;
  if (lastB && Math.abs(fy - by) < 18) {
    if (fy < by) by = fy + 18;
    else fy = by + 18;
  }
  return (
    <figure className="perf-chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Growth of $1,000: ${s.fundLabel} ${money(lastF.value)}${lastB ? `, ${s.benchmarkLabel} ${money(lastB.value)}` : ""} as of ${lastF.label}. Monthly figures are in the table below.`}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="var(--line)" />
            <text x={pl - 10} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--ink-muted)">
              ${t.toLocaleString("en-US")}
            </text>
          </g>
        ))}
        {fund.map((p, i) =>
          i === 0 || i === fund.length - 1 || i % Math.ceil(n / 8) === 0 ? (
            <text key={p.label} x={x(i)} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--ink-muted)">
              {i === 0 ? "Start" : p.label.split(" ")[0]}
            </text>
          ) : null,
        )}
        {lastB && <path d={path(bench)} fill="none" stroke="var(--ink-faint)" strokeWidth="2" strokeDasharray="5 4" />}
        <path d={path(fund)} fill="none" stroke="var(--brand)" strokeWidth="3" />
        <circle cx={x(fund.length - 1)} cy={y(lastF.value)} r="5" fill="var(--brand)" />
        <text x={x(fund.length - 1) + 10} y={fy + 4} fontSize="12" fontWeight="700" fill="var(--ink)">
          {money(lastF.value)}
        </text>
        {lastB && (
          <>
            <circle cx={x(bench.length - 1)} cy={y(lastB.value)} r="4" fill="var(--ink-muted)" />
            <text x={x(bench.length - 1) + 10} y={by + 4} fontSize="12" fill="var(--ink-muted)">
              {money(lastB.value)}
            </text>
          </>
        )}
      </svg>
      <figcaption className="perf-legend micro">
        <span className="key key-fund">{s.fundLabel}</span>
        {s.benchmarkLabel && <span className="key key-bench">{s.benchmarkLabel}</span>}
        <span>Growth of $1,000, from monthly net returns</span>
      </figcaption>
    </figure>
  );
}

export function FundPerformance({ s, first }: { s: Of<"fundPerformance">; first: boolean }) {
  const years = [...(s.years ?? [])].sort((a, b) => b.year - a.year);
  const asOf = s.asOf
    ? new Date(`${s.asOf}T00:00:00Z`).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
    : null;
  return (
    <Shell s={s}>
      <div className="grid-2" style={{ marginBottom: "clamp(24px, 4vw, 48px)" }}>
        <div className="stack">
          {s.heading && <Heading first={first}>{s.heading}</Heading>}
          {asOf && <p className="micro">As of {asOf}</p>}
        </div>
        {s.intro && <p className="lead">{s.intro}</p>}
      </div>
      <GrowthChart s={s} />
      <div className="perf-table-wrap" role="region" aria-label="Monthly net returns" tabIndex={0}>
        <table className="perf-table">
          <caption className="sr-only">Monthly net returns (%)</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              {MONTHS.map((m) => (
                <th scope="col" key={m}>
                  {m}
                </th>
              ))}
              <th scope="col" className="ytd">
                YTD
              </th>
            </tr>
          </thead>
          <tbody>
            {years.flatMap((y) => {
              const rows = [
                { label: `${y.year} ${s.fundLabel}`, vals: y.fund ?? [], ytd: y.fundYtd, fund: true },
                ...(s.benchmarkLabel ? [{ label: s.benchmarkLabel, vals: y.benchmark ?? [], ytd: y.benchmarkYtd, fund: false }] : []),
              ];
              return rows.map((r) => (
                <tr key={`${y._key}-${r.label}`} data-fund={r.fund || undefined}>
                  <th scope="row">{r.label}</th>
                  {MONTHS.map((m, i) => (
                    <td key={m} data-sign={sign(r.vals[i])}>
                      {pct(r.vals[i])}
                    </td>
                  ))}
                  <td className="ytd" data-sign={sign(r.ytd)}>
                    {pct(r.ytd)}
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
      {s.footnote && <p className="footnote micro" style={{ marginTop: 16, textTransform: "none", letterSpacing: 0 }}>{s.footnote}</p>}
    </Shell>
  );
}

export function DataTable({ s, first }: { s: Of<"dataTable">; first: boolean }) {
  const cols = s.columns ?? [];
  return (
    <Shell s={s}>
      <div className="grid-2" style={{ marginBottom: "clamp(20px, 3vw, 40px)" }}>
        {s.heading && <Heading first={first} className="rows-heading">{s.heading}</Heading>}
        {s.intro && <p className="lead">{s.intro}</p>}
      </div>
      <div className="perf-table-wrap" role="region" aria-label={s.heading ?? "Table"} tabIndex={0}>
        <table className="data-table">
          <thead>
            <tr>
              {cols.map((c, i) => (
                <th scope="col" key={i}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {s.rows?.map((r) => (
              <tr key={r._key} data-total={r.total || undefined}>
                {(r.cells ?? []).map((c, i) =>
                  i === 0 ? (
                    <th scope="row" key={i}>
                      {c}
                    </th>
                  ) : (
                    <td key={i}>{c}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {s.note && <p className="cta-body">{s.note}</p>}
    </Shell>
  );
}

export function BarList({ s, first }: { s: Of<"barList">; first: boolean }) {
  const bars = s.bars ?? [];
  const max = Math.max(...bars.map((b) => Math.abs(b.value)), 0.0001);
  const unit = s.unit ?? "";
  const fmt = (v: number) => `${s.signed && v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toLocaleString("en-US", { maximumFractionDigits: 2 })}${unit}`;
  return (
    <Shell s={s}>
      <div className="grid-2" style={{ marginBottom: "clamp(20px, 3vw, 40px)" }}>
        {s.heading && <Heading first={first} className="rows-heading">{s.heading}</Heading>}
        {s.intro && <p className="lead">{s.intro}</p>}
      </div>
      <ul className="bar-list">
        {bars.map((b) => (
          <li key={b._key} data-reveal>
            <div className="bar-head">
              <span className="bar-label">{b.label}</span>
              <span className="bar-value" data-sign={sign(b.value)}>
                {fmt(b.value)}
              </span>
            </div>
            <div className="bar-track" aria-hidden="true">
              <span className="bar-fill" style={{ width: `${(Math.abs(b.value) / max) * 100}%` }} data-neg={b.value < 0 || undefined} />
            </div>
            {b.note && <p className="bar-note">{b.note}</p>}
          </li>
        ))}
      </ul>
    </Shell>
  );
}
