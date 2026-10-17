# Content import notes (Phase 2)

`scripts/import-content.mjs` loads `content/*.md` into Sanity. The copy is the Wix text, verbatim.
Every place where the imported content differs from a literal transcription is listed below.

## Presentation-only normalisations
- ALL-CAPS Wix headings are stored in sentence case (e.g. "FOR PORTFOLIO MANAGERS" → "For portfolio managers").
  Uppercase is a styling choice in the new design, not content. Mixed-case headings are kept exactly as written
  (e.g. "A Structured Path for Talent to Grow.", "Access to High-quality Undiscovered Talent.").
- The home meta description had a stray line break ("Riptide Advisors. \nUncorrelated…"). It is stored as a single line.
- Long Wix paragraphs that were split across text boxes are joined. The home "Our philosophy" text is split
  into a statement ("Great investment talent creates its own momentum.") and the body that follows. The words are unchanged.

## Content choices to confirm
| Item | What I did | Why |
|---|---|---|
| Principles text | Used the **/principles** wording for one sentence: "every individual—partners, team members, and investors—with respect and honesty". /our-principles reads "every individual partners, team members, and investors with respect" and "… trust.” Charlie Munger" (missing dashes). | The /our-principles version looks like a copy/paste loss of the em dashes. Everything else is identical between the two pages. |
| Home "Learn more" | Points to `/our-principles` (Wix pointed to `/principles`, which now 301s there). | Avoids a redirect hop. |
| Home portal panels | Panel taglines reuse the existing section intros. The small meta labels ("Capital solutions · Operating solutions", "Multi-manager funds · Custom managed accounts") are the existing card titles. | No new copy was written. |
| PM / Investor hero intros | Reuse the matching intro sentences from the home page. | The Wix sub-pages had no intro text beneath the H2. |
| Calls to action | Some pages end with the existing "Ready to explore how Riptide can support your investment goals?…" text. | Reused copy only. |
| Specialities | Imported as four tags. | The Wix version had icons with labels only and no descriptions. |

## Not imported
- **Privacy policy**: imported as a **draft only**, marked "changes requested". It is Wix's template text,
  not a policy, so it isn't on the site until compliance supplies the real wording.
- `/home1`, `/principles`, `/book-online`, `/service-page/*`: retired and redirected (see `redirects.csv`).
- Members-only pages: their content couldn't be crawled. This needs a decision (site-inventory.md, blocker #4).
- Wix stock images: not licensed for use outside Wix (image-manifest.csv).

## Placeholders to replace before launch
- **Disclaimer gates** `investors` (on /for-investors) and `site` (footer "Disclaimer") contain clearly
  labelled PLACEHOLDER text so the gate can be tested on staging. Compliance must supply the wording.
- **Forms** render the exact Wix fields but submit nowhere until Phase 4 (HubSpot).
- **/risk calculator** is served as the original HTML in an iframe until Phase 3 ports it to React.
