import { defineField, defineType } from "sanity";
import { DocumentIcon } from "@sanity/icons/Document";
import { sectionMembers } from "../objects/sections";

export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  icon: DocumentIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
    { name: "access", title: "Access" },
  ],
  fields: [
    defineField({ name: "title", type: "string", group: "content", validation: (r) => r.required() }),
    defineField({
      name: "path",
      title: "URL path",
      type: "string",
      group: "content",
      description:
        'Full path, e.g. "/" or "/for-investors". Keep identical to the old Wix URL (see migration/redirects.csv).',
      validation: (r) =>
        r.required().custom(async (value, ctx) => {
          if (!value) return true;
          if (!/^\/([a-z0-9-]+(\/[a-z0-9-]+)*)?$/.test(value)) {
            return "Lowercase path starting with /, no trailing slash";
          }
          const client = ctx.getClient({ apiVersion: "2026-10-01" });
          const id = ctx.document?._id.replace(/^drafts\./, "");
          const taken = await client.fetch(
            `count(*[_type == "page" && path == $path && !(_id in [$id, "drafts." + $id])])`,
            { path: value, id },
          );
          return taken === 0 ? true : "Another page already uses this path";
        }),
    }),
    defineField({ name: "seo", type: "seo", group: "seo", validation: (r) => r.required() }),
    defineField({
      name: "gate",
      title: "Disclaimer gate",
      type: "reference",
      to: [{ type: "disclaimer" }],
      group: "access",
      description: "Visitors must accept this disclaimer before viewing the page.",
    }),
    defineField({ name: "sections", type: "array", group: "content", of: sectionMembers }),
    defineField({ name: "review", type: "review", group: "content" }),
  ],
  orderings: [{ title: "Path", name: "pathAsc", by: [{ field: "path", direction: "asc" }] }],
  preview: {
    select: { title: "title", path: "path", status: "review.status" },
    prepare: ({ title, path, status }) => ({
      title,
      subtitle: `${path ?? ""}${status && status !== "editing" ? `  ·  ${String(status).replace("_", " ")}` : ""}`,
    }),
  },
});
