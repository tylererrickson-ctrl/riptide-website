import type { DocumentBadgeComponent, SanityDocument } from "sanity";
import { contentHash } from "./hash";

type Review = { status?: string; contentHash?: string };

export const ReviewBadge: DocumentBadgeComponent = ({ draft }) => {
  const r = ((draft as (SanityDocument & { review?: Review }) | null)?.review ?? {}) as Review;
  if (!draft || !r.status || r.status === "editing") return null;
  if (r.status === "approved") {
    return r.contentHash === contentHash(draft)
      ? { label: "Approved", color: "success" }
      : { label: "Edited after approval", color: "warning" };
  }
  if (r.status === "in_review") return { label: "In review", color: "primary" };
  if (r.status === "changes_requested") return { label: "Changes requested", color: "danger" };
  return null;
};
