import { defineField, defineType } from "sanity";
import { CheckmarkIcon } from "@sanity/icons/Checkmark";

/** Written by /api/gate-log when a visitor accepts a disclaimer gate. Read-only in Studio. */
export const gateAcceptance = defineType({
  name: "gateAcceptance",
  title: "Disclaimer acceptance",
  type: "document",
  icon: CheckmarkIcon,
  readOnly: true,
  fields: [
    defineField({ name: "scope", type: "string" }),
    defineField({ name: "version", type: "number" }),
    defineField({ name: "path", type: "string" }),
    defineField({ name: "acceptedAt", type: "datetime" }),
    defineField({ name: "ipHash", title: "IP (salted hash)", type: "string" }),
    defineField({ name: "userAgent", type: "string" }),
    defineField({ name: "environment", type: "string" }),
  ],
  orderings: [{ title: "Newest first", name: "acceptedAtDesc", by: [{ field: "acceptedAt", direction: "desc" }] }],
  preview: {
    select: { scope: "scope", v: "version", at: "acceptedAt", env: "environment" },
    prepare: ({ scope, v, at, env }) => ({
      title: `${scope} v${v}`,
      subtitle: `${at ? new Date(at).toLocaleString() : ""} · ${env ?? ""}`,
    }),
  },
});
