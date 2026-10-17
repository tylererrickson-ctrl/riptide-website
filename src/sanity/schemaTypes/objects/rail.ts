import { defineField, defineType } from "sanity";

/** The numbered hairline row that opens a section: "02 — EDGE ........ caption" */
export const rail = defineType({
  name: "rail",
  title: "Section rail",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: "number", type: "string", description: 'e.g. "02"' }),
    defineField({ name: "label", type: "string", description: 'e.g. "Edge"' }),
    defineField({ name: "caption", type: "string", description: "Right-aligned caption" }),
  ],
});
