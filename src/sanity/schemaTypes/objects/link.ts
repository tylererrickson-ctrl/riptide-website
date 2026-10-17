import { defineField, defineType } from "sanity";

export const link = defineType({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "href",
      title: "URL or path",
      description: "Internal paths start with / (e.g. /contact). External links use the full https:// URL.",
      type: "string",
      validation: (r) =>
        r.required().custom((v) =>
          !v || /^(\/|https?:\/\/|mailto:|tel:|#)/.test(v) ? true : "Start with /, https://, mailto:, tel: or #",
        ),
    }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});
