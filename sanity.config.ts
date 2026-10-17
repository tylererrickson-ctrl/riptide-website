"use client";

/**
 * Sanity Studio, embedded at /studio.
 * Editors: see src/sanity/workflow/README.md for the review → approve → publish process.
 */
import { defineConfig, type DocumentActionComponent } from "sanity";
import { structureTool, type StructureResolver } from "sanity/structure";
import { presentationTool, defineLocations } from "sanity/presentation";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId, studioUrl } from "./src/sanity/env";
import { schemaTypes, reviewedTypes } from "./src/sanity/schemaTypes";
import {
  ApproveAction,
  RequestChangesAction,
  RequestReviewAction,
  ReviewedPublishAction,
  ReviewedUnpublishAction,
} from "./src/sanity/workflow/actions";
import { ReviewBadge } from "./src/sanity/workflow/badges";

const SINGLETONS = ["siteSettings"];

const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site settings")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.divider(),
      S.documentTypeListItem("page").title("Pages"),
      S.documentTypeListItem("teamMember").title("Team"),
      S.documentTypeListItem("disclaimer").title("Disclaimer gates"),
      S.divider(),
      S.listItem()
        .title("Awaiting review")
        .child(
          S.documentList()
            .title("Awaiting review")
            .apiVersion(apiVersion)
            .filter('_id in path("drafts.**") && review.status == "in_review"'),
        ),
      S.documentTypeListItem("publishRecord").title("Publish log"),
      S.documentTypeListItem("gateAcceptance").title("Disclaimer acceptance log"),
    ]);

export default defineConfig({
  name: "riptide",
  title: "Riptide Advisors",
  basePath: studioUrl,
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    // Singletons can't be created from the "new document" menu
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETONS.includes(schemaType)),
  },
  plugins: [
    structureTool({ structure }),
    presentationTool({
      previewUrl: { previewMode: { enable: "/api/draft-mode/enable" } },
      resolve: {
        locations: {
          page: defineLocations({
            select: { title: "title", path: "path" },
            resolve: (doc) => ({
              locations: doc?.path ? [{ title: doc.title ?? doc.path, href: doc.path }] : [],
            }),
          }),
        },
      },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  document: {
    actions: (prev, ctx) => {
      if (ctx.schemaType === "publishRecord" || ctx.schemaType === "gateAcceptance") return []; // immutable audit logs
      const isAdmin = !!ctx.currentUser?.roles.some((r) => r.name === "administrator");
      let actions = prev;
      if (!isAdmin) actions = actions.filter((a) => a.action !== "delete");
      if (SINGLETONS.includes(ctx.schemaType)) {
        actions = actions.filter((a) => !["delete", "duplicate", "unpublish"].includes(a.action ?? ""));
      }
      if (!reviewedTypes.includes(ctx.schemaType)) return actions;
      const rest = actions.filter((a) => a.action !== "publish" && a.action !== "unpublish");
      const workflow: DocumentActionComponent[] = [
        ReviewedPublishAction,
        RequestReviewAction,
        ApproveAction,
        RequestChangesAction,
      ];
      return [...workflow, ...rest, ...(SINGLETONS.includes(ctx.schemaType) ? [] : [ReviewedUnpublishAction])];
    },
    badges: (prev, ctx) => (reviewedTypes.includes(ctx.schemaType) ? [ReviewBadge, ...prev] : prev),
    newDocumentOptions: (prev) =>
      prev.filter((t) => !["publishRecord", "gateAcceptance", ...SINGLETONS].includes(t.templateId)),
  },
});
