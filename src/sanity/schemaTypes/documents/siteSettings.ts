import { defineArrayMember, defineField, defineType } from "sanity";
import { CogIcon } from "@sanity/icons/Cog";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "general", title: "General", default: true },
    { name: "nav", title: "Navigation" },
    { name: "footer", title: "Footer" },
    { name: "legal", title: "Legal" },
  ],
  fields: [
    defineField({ name: "siteName", type: "string", group: "general", initialValue: "Riptide Advisors" }),
    defineField({ name: "defaultDescription", type: "text", rows: 3, group: "general" }),
    defineField({ name: "ogImage", title: "Default social share image", type: "image", group: "general" }),
    defineField({ name: "email", type: "string", group: "general" }),
    defineField({ name: "addressLines", type: "array", of: [defineArrayMember({ type: "string" })], group: "general" }),
    defineField({
      name: "locationShort",
      title: "Short location",
      type: "string",
      group: "general",
      description: 'e.g. "Greenwich, CT"',
    }),
    defineField({ name: "linkedin", title: "LinkedIn URL", type: "url", group: "general" }),
    defineField({ name: "headerCta", title: "Header button", type: "link", group: "nav" }),
    defineField({ name: "mainNav", type: "array", of: [defineArrayMember({ type: "link" })], group: "nav" }),
    defineField({ name: "footerTagline", type: "text", rows: 2, group: "footer" }),
    defineField({ name: "footerNav", type: "array", of: [defineArrayMember({ type: "link" })], group: "footer" }),
    defineField({
      name: "legalLinks",
      title: "Legal links (Form ADV, Form CRS, Privacy...)",
      type: "array",
      of: [defineArrayMember({ type: "link" })],
      group: "legal",
    }),
    defineField({
      name: "footerDisclosure",
      title: "Footer disclosure text",
      type: "richText",
      group: "legal",
      description: "Verbatim from compliance.",
    }),
    defineField({
      name: "siteDisclaimer",
      title: "Disclaimer opened from the footer",
      type: "reference",
      to: [{ type: "disclaimer" }],
      group: "legal",
    }),
    defineField({ name: "review", type: "review", group: "general" }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
