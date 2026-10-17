# Compliance checklist (Phase 6), blocking launch

Rule: legal and regulatory wording is pasted into the CMS **verbatim from the compliance-approved
source**. It is never rewritten. Each item goes through the Studio review workflow (request review → second
person approves → publish), so the Publish log records who approved the wording and when.

| # | Item | Status (2026-10-17) | Where it goes in the Studio | Who |
|---|---|---|---|---|
| 1 | **Privacy policy** | ❌ Wix page is template placeholder text, not a policy. Imported as a *draft* only; `/english-privacy-policy` returns 404 until published | Pages → "Privacy Policy" → Legal text section (paste verbatim; record the source in "Approved source") | Compliance supplies, editor pastes, reviewer approves |
| 2 | **Form ADV** link | ❌ Not on the current site | Site settings → Legal → Legal links (e.g. label "Form ADV", URL on adviserinfo.sec.gov / IAPD) | Compliance confirms URL |
| 3 | **Form CRS** link | ❌ Not on the current site. Confirm whether CRS applies to Riptide (it's required for advisers with retail investors) | Site settings → Legal → Legal links | Compliance |
| 4 | **Site-wide disclosure** (footer) | ❌ None on the current site | Site settings → Legal → Footer disclosure text | Compliance |
| 5 | **Investor disclaimer gate** (`/for-investors`) | ✅ Qualified Purchaser notice published 2026-10-17 (v2, verbatim from Tyler). ⚠️ **Still contains a bracketed choice:** "[is a registered investment adviser / relies on an exemption as an exempt reporting adviser]". Compliance must pick one before launch, then bump the Version | Disclaimer gates → "Investor notice" → body. Set Version = 1 when the real text goes in, and bump it on any later change | Compliance |
| 6 | **Footer "Disclaimer" notice** | ⚠️ PLACEHOLDER | Disclaimer gates → "Site disclaimer" | Compliance |
| 7 | Gate settings | Defaults: accept per browser session; acceptance logged (hashed IP); Decline returns home | Same documents: "Require reading to the end", "Persistence", "Record acceptances" | Compliance to confirm |
| 8 | **Members-only pages** (/rof, /rfcf, /meet-our-managers, ...) | Interim 302 → /contact | If fund pages come back, they may need to sit behind an accredited-investor gate or login | Tyler / compliance |
| 9 | **Image licenses** | /for-investors banner looks like Freepik (attribution needed); 4 other uploads unconfirmed | Replace in the Studio, or add a credit (THIRD_PARTY_NOTICES.md) | Tyler |
| 11 | **Fund performance page `/rof`** (built 2026-10-17 from the Aug 2026 factsheet) | Live on staging behind the Qualified Purchaser click-through; noindex; not in nav or sitemap | Pages → "Riptide Opportunities Fund" | **Compliance must approve before launch.** A click-through on a public website may not, by itself, avoid general solicitation for a 506(b) offering; consider a login/password limited to pre-qualified investors. The factsheet also says it "may not be reproduced or distributed without prior written consent" |
| 10 | Marketing-rule review of site copy | Copy carried over from Wix unchanged | n/a | Compliance (optional, recommended for an RIA site) |

Once 1–6 are published, re-run `node scripts/verify-redirects.mjs`. It expects `/english-privacy-policy` to 404
while the policy is a draft, so update that expectation to 200 after publishing.
