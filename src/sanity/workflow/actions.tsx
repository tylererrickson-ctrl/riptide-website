"use client";

import { useState } from "react";
import {
  useClient,
  useCurrentUser,
  useDocumentOperation,
  type DocumentActionComponent,
  type DocumentActionProps,
  type SanityDocument,
} from "sanity";
import { CheckmarkCircleIcon } from "@sanity/icons/CheckmarkCircle";
import { CloseCircleIcon } from "@sanity/icons/CloseCircle";
import { EyeOpenIcon } from "@sanity/icons/EyeOpen";
import { PublishIcon } from "@sanity/icons/Publish";
import { UnpublishIcon } from "@sanity/icons/Unpublish";
import { Stack, Text, TextArea } from "@sanity/ui";
import { apiVersion } from "../env";
import { contentHash } from "./hash";

type Review = {
  status?: "editing" | "in_review" | "changes_requested" | "approved";
  requestedBy?: string;
  requestedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  note?: string;
  contentHash?: string;
};

type User = ReturnType<typeof useCurrentUser>;

const REVIEWER_ROLES = ["administrator", "reviewer"];
const ALLOW_SELF_APPROVAL = process.env.NEXT_PUBLIC_SANITY_ALLOW_SELF_APPROVAL === "true";

const who = (u: User) => (u ? `${u.name ?? u.email ?? u.id} <${u.email ?? u.id}>` : "unknown");
const isReviewer = (u: User) => !!u?.roles?.some((r) => REVIEWER_ROLES.includes(r.name));
const isAdmin = (u: User) => !!u?.roles?.some((r) => r.name === "administrator");
const reviewOf = (d?: SanityDocument | null) => ((d as { review?: Review } | null)?.review ?? {}) as Review;
const titleOf = (d?: SanityDocument | null) =>
  String((d as Record<string, unknown> | null)?.title ?? (d as Record<string, unknown> | null)?.name ?? d?._id ?? "");

/** Editor → "Request review" */
export const RequestReviewAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { patch } = useDocumentOperation(props.id, props.type);
  const user = useCurrentUser();
  const r = reviewOf(props.draft);
  const stale = r.status === "approved" && r.contentHash !== contentHash(props.draft);
  if (!props.draft) return null;
  if (r.status === "in_review" || (r.status === "approved" && !stale)) return null;
  return {
    label: stale ? "Request review again" : "Request review",
    icon: EyeOpenIcon,
    tone: "primary",
    onHandle: () => {
      patch.execute([
        {
          set: {
            review: {
              status: "in_review",
              requestedBy: who(user),
              requestedAt: new Date().toISOString(),
            },
          },
        },
      ]);
      props.onComplete();
    },
  };
};

/** Reviewer → "Approve" (four-eyes: cannot approve your own request) */
export const ApproveAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { patch } = useDocumentOperation(props.id, props.type);
  const user = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const r = reviewOf(props.draft);
  if (!props.draft || r.status !== "in_review") return null;
  const own = r.requestedBy === who(user);
  const disabled = !isReviewer(user) || (own && !ALLOW_SELF_APPROVAL);
  return {
    label: "Approve",
    icon: CheckmarkCircleIcon,
    tone: "positive",
    disabled,
    title: !isReviewer(user)
      ? "Only reviewers (administrator or reviewer role) can approve"
      : own && !ALLOW_SELF_APPROVAL
        ? "A different person must approve your own changes"
        : undefined,
    onHandle: () => setOpen(true),
    dialog: open && {
      type: "confirm",
      tone: "positive",
      message: (
        <Stack gap={3}>
          <Text>Approve these changes for publishing?</Text>
          <TextArea
            placeholder="Optional note for the publish record"
            value={note}
            onChange={(e) => setNote(e.currentTarget.value)}
          />
        </Stack>
      ),
      onCancel: () => setOpen(false),
      onConfirm: () => {
        // The approval covers this exact content (hash ignores review state). Any later edit invalidates it.
        patch.execute([
          {
            set: {
              review: {
                ...r,
                status: "approved",
                reviewedBy: who(user),
                reviewedAt: new Date().toISOString(),
                note: note || undefined,
                contentHash: contentHash(props.draft),
              },
            },
          },
        ]);
        setOpen(false);
        props.onComplete();
      },
    },
  };
};

/** Reviewer → "Request changes" */
export const RequestChangesAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { patch } = useDocumentOperation(props.id, props.type);
  const user = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const r = reviewOf(props.draft);
  if (!props.draft || r.status !== "in_review" || !isReviewer(user)) return null;
  return {
    label: "Request changes",
    icon: CloseCircleIcon,
    tone: "caution",
    onHandle: () => setOpen(true),
    dialog: open && {
      type: "confirm",
      tone: "caution",
      message: (
        <Stack gap={3}>
          <Text>What needs to change?</Text>
          <TextArea value={note} onChange={(e) => setNote(e.currentTarget.value)} />
        </Stack>
      ),
      onCancel: () => setOpen(false),
      onConfirm: () => {
        patch.execute([
          {
            set: {
              review: {
                ...r,
                status: "changes_requested",
                reviewedBy: who(user),
                reviewedAt: new Date().toISOString(),
                note,
              },
            },
          },
        ]);
        setOpen(false);
        props.onComplete();
      },
    },
  };
};

/** Replaces the built-in Publish: only approved, unchanged content can go live, and every publish is recorded. */
export const ReviewedPublishAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { publish, patch } = useDocumentOperation(props.id, props.type);
  const client = useClient({ apiVersion });
  const user = useCurrentUser();
  const [publishing, setPublishing] = useState(false);
  const r = reviewOf(props.draft);
  const hash = contentHash(props.draft);
  const approved = r.status === "approved" && r.contentHash === hash;

  let title: string | undefined;
  if (!props.draft) title = "No unpublished changes";
  else if (r.status !== "approved") title = "Request review and get approval before publishing";
  else if (!approved) title = "Content changed after approval — request review again";
  else if (publish.disabled) title = `Cannot publish: ${publish.disabled}`;

  return {
    label: publishing ? "Publishing…" : "Publish",
    icon: PublishIcon,
    tone: "positive",
    shortcut: "Ctrl+Alt+P",
    disabled: !!title || publishing,
    title,
    onHandle: async () => {
      setPublishing(true);
      const draft = props.draft as SanityDocument;
      await client.create({
        _type: "publishRecord",
        documentId: props.id,
        documentType: props.type,
        documentTitle: titleOf(draft),
        action: "publish",
        publishedAt: new Date().toISOString(),
        publishedBy: who(user),
        requestedBy: r.requestedBy,
        approvedBy: r.reviewedBy,
        approvedAt: r.reviewedAt,
        reviewNote: r.note,
        contentHash: hash,
        snapshot: JSON.stringify({ ...draft, _id: props.id, review: undefined }, null, 2),
      });
      // Reset review state on the version that goes live, so the next draft starts fresh.
      patch.execute([{ set: { review: { status: "editing" } } }]);
      publish.execute();
      setPublishing(false);
      props.onComplete();
    },
  };
};

/** Replaces the built-in Unpublish: administrators only, and recorded. */
export const ReviewedUnpublishAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { unpublish } = useDocumentOperation(props.id, props.type);
  const client = useClient({ apiVersion });
  const user = useCurrentUser();
  const [open, setOpen] = useState(false);
  if (!props.published) return null;
  return {
    label: "Unpublish",
    icon: UnpublishIcon,
    tone: "critical",
    disabled: !isAdmin(user) || !!unpublish.disabled,
    title: !isAdmin(user) ? "Only administrators can unpublish" : undefined,
    onHandle: () => setOpen(true),
    dialog: open && {
      type: "confirm",
      tone: "critical",
      message: "Take this off the live site? This is recorded in the publish log.",
      onCancel: () => setOpen(false),
      onConfirm: async () => {
        await client.create({
          _type: "publishRecord",
          documentId: props.id,
          documentType: props.type,
          documentTitle: titleOf(props.published),
          action: "unpublish",
          publishedAt: new Date().toISOString(),
          publishedBy: who(user),
        });
        unpublish.execute();
        setOpen(false);
        props.onComplete();
      },
    },
  };
};
