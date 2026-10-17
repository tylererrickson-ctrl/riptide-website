import { defineField, defineType } from "sanity";

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: false },
  fields: [
    defineField({
      name: "title",
      title: "Title tag",
      type: "string",
      description: "Shown in browser tabs and search results.",
      validation: (r) => r.required().max(70).warning("Keep under ~60 characters"),
    }),
    defineField({
      name: "description",
      title: "Meta description",
      type: "text",
      rows: 3,
      validation: (r) => r.max(170).warning("Keep under ~160 characters"),
    }),
    defineField({ name: "ogImage", title: "Social share image", type: "image" }),
    defineField({
      name: "noindex",
      title: "Hide from search engines",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
