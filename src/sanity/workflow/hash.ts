import type { SanityDocument } from "sanity";

const IGNORED = new Set(["_id", "_rev", "_updatedAt", "_createdAt", "_system", "review"]);

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .filter((k) => !IGNORED.has(k))
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stable((value as Record<string, unknown>)[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

/** FNV-1a over a stable serialization of the editable content (ignores system fields and review state). */
export function contentHash(doc?: SanityDocument | null): string {
  if (!doc) return "";
  const s = stable(doc);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0") + ":" + s.length.toString(36);
}
