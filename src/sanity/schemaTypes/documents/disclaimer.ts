import { defineField, defineType } from "sanity";
import { WarningOutlineIcon } from "@sanity/icons/WarningOutline";

export const disclaimer = defineType({
  name: "disclaimer",
  title: "Disclaimer gate",
  type: "document",
  icon: WarningOutlineIcon,
  description: "Wording must come verbatim from compliance.",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "scope",
      type: "slug",
      description:
        "Acceptance is remembered per scope (e.g. 'investors'). Pages sharing a scope share one acceptance.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "version",
      type: "number",
      description:
        "Increase this whenever the wording changes. Everyone must accept the new version again.",
      initialValue: 1,
      validation: (r) => r.required().integer().min(1),
    }),
    defineField({ name: "kicker", type: "string", initialValue: "Legal disclaimer" }),
    defineField({
      name: "heading",
      type: "string",
      initialValue: "Important Regulatory Information",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "instruction",
      type: "string",
      initialValue: "Please read the notice below carefully. You must accept the terms before you can proceed.",
    }),
    defineField({ name: "body", type: "richText", validation: (r) => r.required() }),
    defineField({ name: "acceptLabel", type: "string", initialValue: "Accept & enter" }),
    defineField({ name: "declineLabel", type: "string", initialValue: "Decline" }),
    defineField({ name: "declineHref", type: "string", initialValue: "/" }),
    defineField({
      name: "requireScroll",
      title: "Require reading to the end",
      type: "boolean",
      description: "Accept is enabled only after the visitor scrolls to the end of the notice.",
      initialValue: false,
    }),
    defineField({
      name: "persistence",
      type: "string",
      options: {
        list: [
          { title: "Browser session (default)", value: "session" },
          { title: "30 days", value: "days30" },
        ],
        layout: "radio",
      },
      initialValue: "session",
    }),
    defineField({
      name: "logAcceptance",
      title: "Record acceptances (audit log)",
      type: "boolean",
      initialValue: true,
    }),
    defineField({ name: "source", title: "Approved source (internal note)", type: "string" }),
    defineField({ name: "review", type: "review" }),
  ],
  preview: {
    select: { title: "title", scope: "scope.current", v: "version" },
    prepare: ({ title, scope, v }) => ({ title, subtitle: `${scope} · v${v}` }),
  },
});
