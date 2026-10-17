import { defineArrayMember, defineField, defineType, type FieldDefinition } from "sanity";

/**
 * Page sections. Each maps 1:1 to a React section component in
 * src/components/sections. Patterns are described in migration/design-reference.md.
 */

const common: FieldDefinition[] = [
  defineField({ name: "rail", type: "rail" }),
  defineField({
    name: "anchor",
    title: "Anchor id",
    type: "string",
    description: "Optional, for in-page links (#anchor).",
    validation: (r) => r.regex(/^[a-z0-9-]+$/, { name: "kebab-case" }),
  }),
  defineField({
    name: "tone",
    type: "string",
    options: { list: ["light", "dark"], layout: "radio", direction: "horizontal" },
    initialValue: "light",
  }),
];

const imageWithAlt = (name = "image", title = "Image") =>
  defineField({
    name,
    title,
    type: "image",
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        title: "Alt text",
        type: "string",
        description: "Describe the image for screen readers. Leave empty only if purely decorative.",
      }),
    ],
  });

const preview = (titleField: string, kind: string) => ({
  select: { title: titleField },
  prepare: ({ title }: { title?: string }) => ({ title: title || kind, subtitle: kind }),
});

export const heroPortal = defineType({
  name: "heroPortal",
  title: "Hero: portal (home)",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", type: "string" }),
    defineField({ name: "heading", type: "text", rows: 2, validation: (r) => r.required() }),
    defineField({ name: "subheading", type: "text", rows: 3 }),
    imageWithAlt("image", "Background image"),
    defineField({
      name: "panels",
      type: "array",
      validation: (r) => r.max(3),
      of: [
        defineArrayMember({
          type: "object",
          name: "portalPanel",
          fields: [
            defineField({ name: "meta", type: "string", description: "Small right-aligned label" }),
            defineField({ name: "title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "tagline", type: "string" }),
            defineField({ name: "link", type: "link" }),
          ],
          preview: { select: { title: "title", subtitle: "tagline" } },
        }),
      ],
    }),
    defineField({ name: "strip", title: "Bottom strip link", type: "object", fields: [
      defineField({ name: "title", type: "string" }),
      defineField({ name: "tagline", type: "string" }),
      defineField({ name: "link", type: "link" }),
    ] }),
  ],
  preview: preview("heading", "Hero: portal"),
});

export const heroPage = defineType({
  name: "heroPage",
  title: "Hero: page",
  type: "object",
  fields: [
    ...common,
    defineField({ name: "eyebrow", type: "string" }),
    defineField({ name: "heading", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "intro", type: "text", rows: 4 }),
    imageWithAlt(),
    defineField({
      name: "stats",
      title: "Key facts",
      type: "array",
      of: [defineArrayMember({ type: "object", name: "stat", fields: [
        defineField({ name: "label", type: "string" }),
        defineField({ name: "value", type: "string" }),
      ], preview: { select: { title: "label", subtitle: "value" } } })],
    }),
    defineField({ name: "ctas", title: "Buttons", type: "array", of: [defineArrayMember({ type: "link" })] }),
  ],
  preview: preview("heading", "Hero: page"),
});

export const statement = defineType({
  name: "statement",
  title: "Statement (pinned, word reveal)",
  type: "object",
  fields: [
    ...common,
    defineField({ name: "eyebrow", type: "string" }),
    defineField({ name: "text", type: "text", rows: 4, validation: (r) => r.required() }),
    defineField({ name: "body", type: "text", rows: 4 }),
    defineField({ name: "cta", type: "link" }),
  ],
  preview: preview("text", "Statement"),
});

export const explainer = defineType({
  name: "explainer",
  title: "Explainer (label + text)",
  type: "object",
  fields: [
    ...common,
    defineField({ name: "label", type: "string", description: "Small left-column label" }),
    defineField({ name: "heading", type: "string" }),
    defineField({ name: "subheading", type: "string" }),
    defineField({ name: "body", type: "richText" }),
    defineField({ name: "tags", type: "array", of: [defineArrayMember({ type: "string" })] }),
    imageWithAlt(),
    defineField({ name: "ctas", title: "Buttons", type: "array", of: [defineArrayMember({ type: "link" })] }),
  ],
  preview: preview("heading", "Explainer"),
});

export const cardGrid = defineType({
  name: "cardGrid",
  title: "Card grid",
  type: "object",
  fields: [
    ...common,
    defineField({ name: "heading", type: "string" }),
    defineField({ name: "intro", type: "text", rows: 3 }),
    defineField({
      name: "cards",
      type: "array",
      of: [defineArrayMember({ type: "object", name: "card", fields: [
        imageWithAlt("icon", "Icon"),
        defineField({ name: "title", type: "string", validation: (r) => r.required() }),
        defineField({ name: "subtitle", type: "string" }),
        defineField({ name: "body", type: "text", rows: 5 }),
        defineField({ name: "cta", type: "link" }),
      ], preview: { select: { title: "title", subtitle: "subtitle", media: "icon" } } })],
    }),
  ],
  preview: preview("heading", "Card grid"),
});

export const stepper = defineType({
  name: "stepper",
  title: "Process stepper",
  type: "object",
  fields: [
    ...common,
    defineField({ name: "eyebrow", type: "string" }),
    defineField({ name: "heading", type: "string" }),
    defineField({ name: "intro", type: "text", rows: 3 }),
    defineField({
      name: "steps",
      type: "array",
      validation: (r) => r.min(2).max(6),
      of: [defineArrayMember({ type: "object", name: "step", fields: [
        defineField({ name: "title", type: "string", validation: (r) => r.required() }),
        defineField({ name: "body", type: "text", rows: 3 }),
      ], preview: { select: { title: "title", subtitle: "body" } } })],
    }),
    defineField({ name: "footnote", type: "text", rows: 2 }),
    defineField({ name: "cta", type: "link" }),
  ],
  preview: preview("heading", "Stepper"),
});

export const timeline = defineType({
  name: "timeline",
  title: "Chapters (horizontal timeline)",
  type: "object",
  fields: [
    ...common,
    defineField({ name: "eyebrow", type: "string" }),
    defineField({ name: "heading", type: "string" }),
    defineField({ name: "intro", type: "text", rows: 3 }),
    defineField({
      name: "chapters",
      type: "array",
      of: [defineArrayMember({ type: "object", name: "chapter", fields: [
        defineField({ name: "marker", type: "string", description: 'Large background marker, e.g. "01" or "2021"' }),
        defineField({ name: "title", type: "string", validation: (r) => r.required() }),
        defineField({ name: "epigraph", type: "text", rows: 2 }),
        defineField({ name: "attribution", type: "string" }),
        defineField({ name: "body", type: "richText" }),
        imageWithAlt(),
      ], preview: { select: { title: "title", subtitle: "marker", media: "image" } } })],
    }),
  ],
  preview: preview("heading", "Chapters"),
});

export const objectives = defineType({
  name: "objectives",
  title: "List rows (title + text)",
  type: "object",
  fields: [
    ...common,
    defineField({ name: "eyebrow", type: "string" }),
    defineField({ name: "heading", type: "string" }),
    defineField({ name: "intro", type: "text", rows: 3 }),
    defineField({
      name: "rows",
      type: "array",
      of: [defineArrayMember({ type: "object", name: "row", fields: [
        defineField({ name: "title", type: "string", validation: (r) => r.required() }),
        defineField({ name: "body", type: "text", rows: 3 }),
      ], preview: { select: { title: "title", subtitle: "body" } } })],
    }),
    defineField({ name: "cta", type: "link" }),
  ],
  preview: preview("heading", "List rows"),
});

export const teamGrid = defineType({
  name: "teamGrid",
  title: "Team",
  type: "object",
  fields: [
    ...common,
    defineField({ name: "heading", type: "string" }),
    defineField({ name: "members", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "teamMember" }] })] }),
  ],
  preview: preview("heading", "Team"),
});

export const contactBlock = defineType({
  name: "contactBlock",
  title: "Contact details",
  type: "object",
  fields: [
    ...common,
    defineField({ name: "heading", type: "string" }),
    defineField({ name: "body", type: "text", rows: 3 }),
    defineField({ name: "showEmail", type: "boolean", initialValue: true }),
    defineField({ name: "showLocation", type: "boolean", initialValue: true }),
    defineField({ name: "cta", title: "Button", type: "link" }),
  ],
  preview: preview("heading", "Contact details"),
});

export const formsSection = defineType({
  name: "formsSection",
  title: "Forms",
  type: "object",
  fields: [
    ...common,
    defineField({ name: "heading", type: "string" }),
    defineField({ name: "intro", type: "text", rows: 3 }),
    defineField({
      name: "forms",
      type: "array",
      of: [defineArrayMember({ type: "object", name: "formRef", fields: [
        defineField({ name: "title", type: "string", validation: (r) => r.required() }),
        defineField({ name: "key", type: "string", description: "Which form to render", options: { list: [
          { title: "Portfolio Manager", value: "portfolio-manager" },
          { title: "Allocator / Investor", value: "allocator" },
          { title: "Mailing list sign-up", value: "mailing-list" },
        ] }, validation: (r) => r.required() }),
        defineField({ name: "hubspotFormId", title: "HubSpot form ID", type: "string", description: "Set in Phase 4" }),
        defineField({ name: "successMessage", type: "string", initialValue: "Thanks for submitting!" }),
      ], preview: { select: { title: "title", subtitle: "key" } } })],
    }),
    defineField({ name: "note", title: "Small print under the form", type: "text", rows: 2 }),
  ],
  preview: preview("heading", "Forms"),
});

export const marquee = defineType({
  name: "marquee",
  title: "Marquee ticker",
  type: "object",
  fields: [
    ...common,
    defineField({ name: "items", type: "array", of: [defineArrayMember({ type: "string" })], validation: (r) => r.min(2) }),
  ],
  preview: { select: { items: "items" }, prepare: ({ items }: { items?: string[] }) => ({ title: (items || []).join(" · "), subtitle: "Marquee" }) },
});

export const quote = defineType({
  name: "quote",
  title: "Pull quote",
  type: "object",
  fields: [
    ...common,
    defineField({ name: "text", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "attribution", type: "string" }),
  ],
  preview: preview("text", "Quote"),
});

export const cta = defineType({
  name: "cta",
  title: "Call to action",
  type: "object",
  fields: [
    ...common,
    defineField({ name: "heading", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", type: "text", rows: 3 }),
    defineField({ name: "link", type: "link" }),
    defineField({ name: "note", type: "string", description: "Small print" }),
  ],
  preview: preview("heading", "CTA"),
});

export const imageBand = defineType({
  name: "imageBand",
  title: "Full-width image",
  type: "object",
  fields: [...common, imageWithAlt(), defineField({ name: "caption", type: "string" })],
  preview: { select: { media: "image", title: "caption" }, prepare: ({ media, title }) => ({ media, title: title || "Image", subtitle: "Full-width image" }) },
});

export const legalText = defineType({
  name: "legalText",
  title: "Legal / long-form text",
  type: "object",
  description: "Legal and compliance wording must be pasted verbatim from the approved source.",
  fields: [
    ...common,
    defineField({ name: "heading", type: "string" }),
    defineField({ name: "lastUpdated", type: "date" }),
    defineField({ name: "body", type: "richText", validation: (r) => r.required() }),
    defineField({ name: "source", title: "Approved source (internal note)", type: "string", description: "Not shown on the site. e.g. 'Compliance memo 2026-10-20'" }),
  ],
  preview: preview("heading", "Legal text"),
});

export const toolEmbed = defineType({
  name: "toolEmbed",
  title: "Interactive tool",
  type: "object",
  fields: [
    ...common,
    defineField({ name: "tool", type: "string", options: { list: [{ title: "Maximum Leverage Calculator", value: "leverage-calculator" }] }, validation: (r) => r.required() }),
    defineField({ name: "heading", type: "string" }),
    defineField({ name: "intro", type: "text", rows: 3 }),
  ],
  preview: preview("tool", "Interactive tool"),
});


/* ---------- Fund / performance sections ---------- */

export const keyFacts = defineType({
  name: "keyFacts",
  title: "Key facts (label / value grid)",
  type: "object",
  fields: [
    ...common,
    defineField({ name: "heading", type: "string" }),
    defineField({
      name: "facts",
      type: "array",
      of: [defineArrayMember({ type: "object", name: "fact", fields: [
        defineField({ name: "label", type: "string", validation: (r) => r.required() }),
        defineField({ name: "value", type: "string", validation: (r) => r.required() }),
        defineField({ name: "emphasis", type: "boolean", description: "Show as a large headline figure" }),
      ], preview: { select: { title: "label", subtitle: "value" } } })],
    }),
    defineField({ name: "note", type: "string" }),
  ],
  preview: preview("heading", "Key facts"),
});

export const fundPerformance = defineType({
  name: "fundPerformance",
  title: "Fund performance (chart + monthly table)",
  type: "object",
  description: "Enter official monthly NET returns. YTD/annual figures are entered as reported, never recomputed.",
  fields: [
    ...common,
    defineField({ name: "heading", type: "string" }),
    defineField({ name: "intro", type: "text", rows: 2 }),
    defineField({ name: "fundLabel", type: "string", initialValue: "Fund", validation: (r) => r.required() }),
    defineField({ name: "benchmarkLabel", type: "string" }),
    defineField({ name: "asOf", title: "As of", type: "date" }),
    defineField({
      name: "years",
      type: "array",
      of: [defineArrayMember({ type: "object", name: "perfYear", fields: [
        defineField({ name: "year", type: "number", validation: (r) => r.required().integer() }),
        defineField({ name: "fund", title: "Fund monthly returns (%), Jan→Dec", type: "array", of: [defineArrayMember({ type: "number" })], validation: (r) => r.max(12) }),
        defineField({ name: "benchmark", title: "Benchmark monthly returns (%), Jan→Dec", type: "array", of: [defineArrayMember({ type: "number" })], validation: (r) => r.max(12) }),
        defineField({ name: "fundYtd", title: "Fund YTD / annual (%), as reported", type: "number" }),
        defineField({ name: "benchmarkYtd", title: "Benchmark YTD / annual (%), as reported", type: "number" }),
      ], preview: { select: { title: "year", subtitle: "fundYtd" }, prepare: ({ title, subtitle }) => ({ title: String(title), subtitle: subtitle != null ? `YTD ${subtitle}%` : "" }) } })],
    }),
    defineField({ name: "footnote", type: "text", rows: 2 }),
  ],
  preview: preview("heading", "Fund performance"),
});

export const dataTable = defineType({
  name: "dataTable",
  title: "Table",
  type: "object",
  fields: [
    ...common,
    defineField({ name: "heading", type: "string" }),
    defineField({ name: "intro", type: "text", rows: 3 }),
    defineField({ name: "columns", type: "array", of: [defineArrayMember({ type: "string" })], validation: (r) => r.min(2) }),
    defineField({
      name: "rows",
      type: "array",
      of: [defineArrayMember({ type: "object", name: "tableRow", fields: [
        defineField({ name: "cells", type: "array", of: [defineArrayMember({ type: "string" })] }),
        defineField({ name: "total", title: "Total row", type: "boolean" }),
      ], preview: { select: { cells: "cells" }, prepare: ({ cells }: { cells?: string[] }) => ({ title: (cells ?? []).join(" · ") }) } })],
    }),
    defineField({ name: "note", type: "text", rows: 3 }),
  ],
  preview: preview("heading", "Table"),
});

export const barList = defineType({
  name: "barList",
  title: "Bar list (labelled values)",
  type: "object",
  fields: [
    ...common,
    defineField({ name: "heading", type: "string" }),
    defineField({ name: "intro", type: "text", rows: 3 }),
    defineField({ name: "unit", type: "string", initialValue: "%" }),
    defineField({ name: "signed", title: "Show + sign on positive values", type: "boolean", initialValue: false }),
    defineField({
      name: "bars",
      type: "array",
      of: [defineArrayMember({ type: "object", name: "bar", fields: [
        defineField({ name: "label", type: "string", validation: (r) => r.required() }),
        defineField({ name: "value", type: "number", validation: (r) => r.required() }),
        defineField({ name: "note", type: "string" }),
      ], preview: { select: { title: "label", subtitle: "value" } } })],
    }),
  ],
  preview: preview("heading", "Bar list"),
});

export const sectionTypes = [
  heroPortal, heroPage, statement, explainer, cardGrid, stepper, timeline, objectives,
  teamGrid, contactBlock, formsSection, marquee, quote, cta, imageBand, legalText, toolEmbed,
  keyFacts, fundPerformance, dataTable, barList,
];

export const sectionMembers = sectionTypes.map((t) => defineArrayMember({ type: t.name }));
