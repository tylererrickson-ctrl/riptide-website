/**
 * Phase 2 interim: serves Riptide's existing calculator (formerly a Wix HTML embed)
 * from /tools/leverage-calculator.html. Phase 3 ports it to a native React component.
 */
export function LeverageCalculator() {
  return (
    <iframe
      src="/tools/leverage-calculator.html"
      title="Maximum Leverage Calculator"
      className="tool-frame"
      loading="lazy"
      style={{ width: "100%", minHeight: "1600px", border: 0 }}
    />
  );
}
