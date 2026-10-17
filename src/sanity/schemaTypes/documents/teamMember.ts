import { defineField, defineType } from "sanity";
import { UserIcon } from "@sanity/icons";

export const teamMember = defineType({
  name: "teamMember",
  title: "Team member",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role", type: "string" }),
    defineField({
      name: "photo",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", type: "string" })],
    }),
    defineField({ name: "linkedin", title: "LinkedIn URL", type: "url" }),
    defineField({ name: "bio", type: "text", rows: 5 }),
    defineField({ name: "order", type: "number" }),
    defineField({ name: "review", type: "review" }),
  ],
  orderings: [{ title: "Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "role", media: "photo" } },
});
