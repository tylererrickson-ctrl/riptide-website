# Editing the website: review → approve → publish

The CMS is at **`/studio`** on any deployment (staging or production). Sign in with your Sanity account.

## The rules

1. **Nothing goes live without a second person's approval.** Editors make changes in a *draft*.
   Drafts are never shown on the public site.
2. **Approval covers exact content.** If anyone edits a draft after it was approved, the approval
   no longer counts ("Edited after approval" badge) and review must be requested again.
3. **Every publish is recorded forever** in **Publish log**. Each record holds who requested it, who approved it,
   who published it, when, the reviewer's note, and a full copy of what went live. This is separate from
   Sanity's built-in history, which is kept for a limited time depending on the plan.
4. Only **administrators** can unpublish or delete. Unpublishing is also recorded.

## Step by step

| Who | Where | What |
|---|---|---|
| Editor | Open a page → edit | Changes save automatically as a draft. Use **Presentation** (top bar) to preview the draft on the real site. |
| Editor | Bottom bar → **Request review** | Badge shows *In review*. The page appears under **Awaiting review**. |
| Reviewer | Content → **Awaiting review** | Check the changes (the **History** panel highlights what changed). Then **Approve**, with an optional note, or **Request changes**, with a note. You cannot approve your own request. |
| Editor or reviewer | Bottom bar → **Publish** | Enabled only when the badge says *Approved*. Publishing writes the Publish log record and the site updates within seconds. |

## Roles

- **Reviewer**: any user with the `administrator` role, or a custom `reviewer` role (custom roles need
  a paid Sanity plan).
- **Self-approval** is off. For a one-person emergency fix, an administrator can set
  `NEXT_PUBLIC_SANITY_ALLOW_SELF_APPROVAL=true` in Vercel, redeploy, and turn it off again afterwards. Every
  publish is still logged.

## Legal and compliance text

Disclaimer gates, the privacy policy, Form ADV/CRS links and footer disclosures must be pasted
**verbatim** from the compliance-approved source. Record that source in the "Approved source" field.
When the wording of a disclaimer changes, raise its **Version** number so every visitor has to accept it again.

## Other logs

- **Disclaimer acceptance log**: one row per visitor acceptance of a disclaimer gate (scope, version, page,
  time, salted IP hash, browser). It contains no names or emails.
