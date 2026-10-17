# Forms → Notion (Phase 4)

**Decision (2026-10-17):** use Notion instead of HubSpot. The site keeps its own forms (exact Wix fields,
site styling, accessible). `POST /api/lead` validates each submission on the server and writes it to Notion
through the Notion API. No third-party scripts load on the page and no cookies are set.

## Destinations
| Form | Notion database | Data source ID |
|---|---|---|
| Portfolio Manager | **PM Pipeline** (existing, live pipeline) | `49da9ae6-ee9b-83c7-b91c-8785b2480cee` |
| Allocator / Investor | **Website Inquiries — Investors** (new, private, workspace level; move it anywhere) | `711e3e24-39fa-48b8-b1e5-7bd670aaf38d` |

## Field mapping
### Portfolio Manager → PM Pipeline
| Form field | PM Pipeline property | Rule |
|---|---|---|
| First + Last Name | **Firm Name** (title) and **Contact Name** | The form has no firm field; rename the title once known |
| Email | Email | |
| Strategy (checkboxes) | Strategy (multi-select) | All five options already exist in the pipeline |
| Current Role (checkboxes) | Current Role (select) | Set to "Running Fund" only if ticked (the only overlapping option) |
| Peak AUM/Risk Capital (text) | AUM (number) | Only if clearly parseable ("$40m", "1.2bn", "250,000,000"); otherwise left blank |
| Current Prime Broker (text) | Prime Broker(s) (select) | Only if it exactly matches an existing option (OPCO, IB, Clear Street, IBKR, StoneX) |
| Stock/Investment Idea | — | Notes |
| Strategy Description | Strategy Description | |
| How can Riptide help you? | How can Riptide help you? | |
| — | Lead Source = **Intake Form**, Date = submission date | |
| All answers as typed | **Notes** | Every role, AUM, prime broker and idea value is kept verbatim here |

The site **never creates new select options** in PM Pipeline. New leads are given **Status = "Intro Stage: TE"**, the first pipeline stage.
(The database default status is "Strategy Review (SG)", which is why the status is set explicitly.)

**Verified end to end on staging 2026-10-17:** both forms were submitted in a real browser and landed in Notion with every field mapped as above.

### Allocator → Website Inquiries — Investors
Name, Email, Allocator Type / Title / Mandate (multi-select, same options as the form), Investment Size,
How can Riptide help you?, Lead Source = Website form, Status = New. "Submitted" is the row's created time.

## Spam protection
- Hidden honeypot field, plus a minimum of 3 seconds between page load and submit. Bot hits get a fake success and nothing is stored.
- Per-IP rate limit: 5 submissions per 10 minutes. This is best effort, per server instance.
- Strict server-side validation: required fields, a valid email, only known checkbox values, and length caps.
- If spam becomes a problem, add Cloudflare Turnstile. It's a third-party script, so it needs your approval first.

## Setup (done by Tyler: the key never passes through Claude)
1. notion.so/profile/integrations → **New integration** → Internal, workspace "Tyler Errickson's Workspace",
   name "Riptide website". Capabilities: **Insert content** only (no Read or Update needed).
2. Open **PM Pipeline** → ••• → Connections → add "Riptide website". Do the same for **Website Inquiries — Investors**.
3. Add the key to Vercel (Production + Preview) and to `.env.local`:
   `NOTION_API_KEY=…`, `NOTION_PM_DATA_SOURCE_ID=49da9ae6-ee9b-83c7-b91c-8785b2480cee`,
   `NOTION_INVESTOR_DATA_SOURCE_ID=711e3e24-39fa-48b8-b1e5-7bd670aaf38d`.
4. Optional alerts: in each database, use ⚡ Automations → "When page added" → send a Slack message or an email.

Until the key is set, the form shows "This form isn't connected yet. Please email info@riptide-advisors.com."

## Tracking / analytics scripts
The audit found **none** on the Wix site (site-inventory.md §8), so there's nothing to carry over. Nothing has been added.
Options if you want them (each needs your approval): Vercel Web Analytics (cookieless), GA4, LinkedIn Insight Tag.
GA4 and LinkedIn would also need a cookie-consent banner.
