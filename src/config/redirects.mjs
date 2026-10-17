// Single source of truth: migration/redirects.csv (Phase 1 audit). Parsed at build time.
import { readFileSync } from "node:fs";
import path from "node:path";

/** Minimal RFC 4180 CSV parser (quoted fields, escaped quotes). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.some((x) => x !== ""));
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}

export function loadRedirectRows(root = process.cwd()) {
  return parseCsv(readFileSync(path.join(root, "migration", "redirects.csv"), "utf8"));
}

/**
 * Path redirects for next.config `redirects()`.
 * Host (apex→www, http→https) rows are Vercel domain settings; the trailing-slash row is handled in src/proxy.ts.
 */
export function loadRedirects(root) {
  return loadRedirectRows(root)
    .filter((r) => (r.status === "301" || r.status === "302") && r.old_url.startsWith("/") && !r.old_url.includes("*"))
    .filter((r) => r.old_url !== r.new_url)
    .map((r) => ({ source: r.old_url, destination: r.new_url, statusCode: Number(r.status) }));
}
