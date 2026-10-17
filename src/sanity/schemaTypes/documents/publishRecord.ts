import { defineField, defineType } from "sanity";
import { ArchiveIcon } from "@sanity/icons";

/**
 * Immutable audit record written by the Publish action every time something
 * goes live. Kept forever, independent of Sanity's plan-limited history.
 */
export const publishRecord = defineType({
  name: "publishRecord",
  title: "Publish record",
  type: "document",
  icon: ArchiveIcon,
  readOnly: true,
  fields: [
    defineField({ name: "documentId", type: "string" }),
    defineField({ name: "documentType", type: "string" }),
    defineField({ name: "documentTitle", type: "string" }),
    defineField({ name: "action", type: "string", options: { list: ["publish", "unpublish"] } }),
    defineField({ name: "publishedAt", type: "datetime" }),
    defineField({ name: "publishedBy", type: "string" }),
    defineField({ name: "requestedBy", type: "string" }),
    defineField({ name: "approvedBy", type: "string" }),
    defineField({ name: "approvedAt", type: "datetime" }),
    defineField({ name: "reviewNote", type: "text" }),
    defineField({ name: "contentHash", type: "string" }),
    defineField({ name: "snapshot", title: "Published content (JSON)", type: "text" }),
  ],
  orderings: [
    { title: "Newest first", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] },
  ],
  preview: {
    select: { title: "documentTitle", action: "action", by: "publishedBy", at: "publishedAt" },
    prepare: ({ title, action, by, at }) => ({
      title: `${action === "unpublish" ? "Unpublished" : "Published"}: ${title}`,
      subtitle: `${by ?? "?"} · ${at ? new Date(at).toLocaleString() : ""}`,
    }),
  },
});
