import { defineField, defineType } from "sanity";

/**
 * Review state, stored on the draft. Set only by the workflow actions in
 * src/sanity/workflow (never edited by hand). See src/sanity/workflow/README.md.
 */
export const review = defineType({
  name: "review",
  title: "Review",
  type: "object",
  readOnly: true,
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "status",
      type: "string",
      options: { list: ["editing", "in_review", "changes_requested", "approved"] },
    }),
    defineField({ name: "requestedBy", type: "string" }),
    defineField({ name: "requestedAt", type: "datetime" }),
    defineField({ name: "reviewedBy", type: "string" }),
    defineField({ name: "reviewedAt", type: "datetime" }),
    defineField({ name: "note", type: "text", rows: 2 }),
    defineField({ name: "contentHash", type: "string", hidden: true }),
  ],
});
