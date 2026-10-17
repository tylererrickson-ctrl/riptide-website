# riptide-advisors.com — Site Inventory (Phase 1 audit)

Crawled 2026-10-17 from the live Wix site (Wix "Thunderbolt" renderer, site revision 270).
Sources: Wix sitemaps (`/sitemap.xml` → 3 child sitemaps), the Wix page registry embedded
in every page's JSON, a headless-browser render of each page (desktop, 1440px), and direct
probes of every slug in that registry.

Companion files:
- `migration/redirects.csv` — old → new URL map, with decisions
- `migration/image-manifest.csv` — every downloaded image, its new path and license status
- `content/*.md` — page copy, one file per page, with title/description in frontmatter
- `content/risk.leverage-calculator.html` — source of the /risk calculator embed
- `public/images/` — Riptide-owned images (14 files)

---

## 1. Blockers and decisions for you before Phase 2

| # | Issue | Why it matters | What I need |
|---|---|---|---|
| 1 | ~~argan.ai is not open source.~~ **RESOLVED 2026-10-17:** use argan as inspiration only — replicate structure, design language and interactions (incl. the disclaimer gate) in original code; no copying of their code, copy, fonts or artwork. See `migration/design-reference.md`. | | |
| 2 | **The privacy policy is Wix placeholder text**, not a policy. It literally says "general and high-level explanations ... on how to write your own document of a Privacy Policy" and links to Wix support. | "Carry over word for word" would publish template filler on a registered adviser's site. | A real privacy policy from compliance (Salus GRC?). |
| 3 | **No Form ADV, Form CRS, or disclaimer content exists anywhere on the current site** (searched all 15 public pages, the members pages, and the calculator embed). | Phase 6 assumes these exist to carry over. | The ADV/CRS links (IAPD / adviserinfo.sec.gov) and the exact disclaimer text from compliance. |
| 4 | **11 members-only pages** (Wix Members Area), two of which are in the public nav/CTAs: `/meet-our-managers` (main nav + /for-investors) and `/idea-hub` (/for-portfolio-managers). Others: `/rof`, `/rfcf`, `/partners`, `/managers`, `/capital`, `/roles`, `/launch`, `/ecm`. Their content is not crawlable without logging in. | Need to know whether the new site rebuilds gated content (needs auth — e.g. Clerk/Auth.js + a Sanity "private" flag) or links out / drops them. | Decision per page, and a member login (or Wix export) if they're being migrated. |
| 5 | **Stock images from the Wix media library** (11 files) are used on /our-principles, /principles, /services, /about, /contact, /home1. Wix's media license covers use on Wix sites only. | They can't move to the new site. | OK to replace with licensed/owned imagery in Phase 3. Placeholders are marked in the content files. |
| 6 | **Uncertain-license uploads**: the /for-investors banner is a Freepik file (`close-up-wavy-water-rocky-seashore_23-2148229817.jpg`; free tier requires attribution), plus the home hero, PM banner and two icons. | Need provenance before reuse. | Confirm source/license, or replace. Flagged in `image-manifest.csv`. |
| 7 | **Orphan / duplicate pages**: `/principles` (older copy of `/our-principles`, still linked from footer + home "Learn More"), `/home1` (unlinked alt homepage with *different fund names* — "Flexible Equity Fund", "Market Neutral Fund"), `/about` + `/services` (only reachable from each other/home1), and Wix Bookings leftovers (`/book-online`, 3 `/service-page/*` pages at $75–$200, robots=index and in the sitemap). | Proposed handling is in `redirects.csv` (`decision` column). The Bookings pages look like Wix template content that is being indexed. | Approve or change the proposed decisions. |
| 8 | **Existing Wix redirects** can't all be seen from outside. I found two (`/analytics`, `/profile`). | Any others would be lost. | Export from Wix Dashboard → SEO → URL Redirect Manager (CSV) so I can merge it. |

---

## 2. Site-wide facts

| Item | Value |
|---|---|
| Canonical host | `https://www.riptide-advisors.com` (apex 301 → www; http 301 → https, two hops for apex) |
| Trailing slash | stripped with 301 (`/contact/` → `/contact`) |
| Case | case-sensitive (`/CONTACT` → 404) |
| DNS | GoDaddy (`ns53/ns54.domaincontrol.com`) — relevant to Phase 7 |
| Email | Mimecast MX (`us-smtp-inbound-1/2.mimecast.com`) — must not change at cutover |
| robots.txt | Wix default: allow all, disallow `*?lightbox=`, AdsBot rules, PetalBot blocked |
| Sitemaps | `/sitemap.xml` index → `pages-sitemap.xml` (13 URLs), `booking-services-sitemap.xml` (3), `member-profiles_p_first-chunk-sitemap.xml` (empty) |
| Favicon | Riptide wave mark (`public/images/logo-mark.png`) |
| Fonts in use | Poppins (Google, via Wix cache) and Wix default sans |
| Brand colors seen | Navy `#00336A` (specialties band, cards, footer), Wix theme blues `#003A96` / `#001D4B`, mint accent `#3DDAAA` ("SPECIALITIES"), cyan→blue gradient logo. The /risk calculator already uses a richer token set: ink `#003362`, heading `#2E5AAE`, accent `#00A9D8`, accent-mid `#1B76B9`, amber `#C97B1D`, with a dark mode — a good starting point for the new tokens. |
| Missing H1s | 6 of 8 live pages have no `<h1>` (headings are h2/h5). The home page has three. Fix in Phase 3/5. |
| Meta descriptions | Only the home page has one (and it contains a stray newline). Every other live page has none; the Wix Bookings leftovers and the privacy page have descriptions. We need copy for the new site. |
| Velo code | `isWixCodeOnSite: true`. There's custom Wix code somewhere, probably the members pages. It isn't visible from outside. |

### Navigation (header, every page)

HOME `/` · ANALYTICS `/analytics` (→ external) · FOR INVESTORS `/for-investors` · FOR PORTFOLIO MANAGERS `/for-portfolio-managers` · MEET OUR MANAGERS `/meet-our-managers` (members-only) · PRINCIPLES `/our-principles` · CONTACT US `/contact` · RISK `/risk`

### Footer (every page)

"Back to Home" · white logo · tagline *"Access to differentiated active strategies, lower all-in fees, improved liquidity, and better transparency through SMAs."* · Quick links: Home, For Portfolio Managers, For Investors, **Principles → `/principles`** (the duplicate, not the nav's `/our-principles`), Contact Us · `info@riptide-advisors.com` · 12 Havemeyer Place, Greenwich CT 06830 · LinkedIn `linkedin.com/company/riptide-advisors/`. **No copyright line, no disclaimers, no privacy policy link.**

---

## 3. Page inventory

Status key: **migrate** = rebuild on new site · **review** = your call · **retire** = 301 away.

### Public pages

| URL | Title | Meta description | H1 | Status |
|---|---|---|---|---|
| `/` | Riptide Advisors \| Emerging Managers | "Riptide Advisors. Uncorrelated Returns. SMAs. Extraordinary People." | UNCORRELATED RETURNS DRIVEN BY EXTRAORDINARY PEOPLE (+ "FOR PORTFOLIO MANAGERS", "FOR CAPITAL PARTNERS" also as h1) | migrate |
| `/for-investors` | FOR INVESTORS \| Riptide Advisors | — none — | — none — (h2 "FOR INVESTORS") | migrate |
| `/for-portfolio-managers` | FOR PORTFOLIO MANAGERS \| Riptide Advisors | — none — | — none — (h2 "FOR PORTFOLIO MANAGERS") | migrate |
| `/our-principles` | PRINCIPLES \| Riptide Advisors | — none — | — none — (h2 "OUR PRINCIPLES") | migrate |
| `/contact` | CONTACT US \| Riptide Advisors | — none — | — none — (h2 "CONTACT US") | migrate |
| `/risk` | RISK \| Riptide Advisors | — none — | — none — (inside iframe: "Maximum Leverage Calculator") | migrate |
| `/english-privacy-policy` | Privacy Policy \| Riptide Advisors | "Riptide Advisors is a hedge fund platform serving emerging managers via SMA and LP investments." | Privacy Policy | migrate (**blocked**, see #2) |
| `/about` | About \| Riptide Advisors | — none — | About Riptide | review (orphan) |
| `/services` | Services \| Riptide Advisors | — none — | How We Serve | review (orphan) |
| `/principles` | PRINCIPLES \| Riptide Advisors | — none — | Principles | retire → `/our-principles` |
| `/home1` | Riptide Advisors \| Platform | "Riptide Advisors. One Platform. Infinite Potential." | — none — | retire → `/` |
| `/copy-of-home` | Riptide Advisors \| Emerging Managers | (same as `/`) | (same as `/`) | retire → `/` (Wix slug of live homepage) |
| `/book-online` | Book Online \| Riptide Advisors | — none — | — none — | retire → `/contact` |
| `/service-page/investment-workshop` | Investment Workshop \| Riptide Advisors | "Join us for an engaging online workshop…" (Wix template copy) | Investment Workshop | retire → `/contact` |
| `/service-page/portfolio-review` | Portfolio Review \| Riptide Advisors | "Let us evaluate the health of your investment portfolio…" (template) | Portfolio Review | retire → `/contact` |
| `/service-page/strategy-consultation` | Strategy Consultation \| Riptide Advisors | "Dive deep into cutting-edge investment strategies…" (template) | Strategy Consultation | retire → `/contact` |

### Redirects that exist today

| From | To | Code |
|---|---|---|
| `/analytics` | `https://riptide-analytics.vercel.app` (→ 307 `/login`) | 301 |
| `/profile` | `https://riptide-advisors.notion.site/248a9ae6ee9b80ca9c53c36d296ba8ca` | 301 |
| `riptide-advisors.com/*` | `www.riptide-advisors.com/*` | 301 |
| `http://*` | `https://*` | 301 |

### Members-only pages (Wix Members Area — content not crawled)

`/meet-our-managers` (Meet Our Managers), `/idea-hub` (Idea Hub), `/rof` (Riptide Opportunities Fund), `/rfcf` (Riptide Flexible Capital Fund), `/partners` (Partners), `/managers` (Manager Pipeline), `/capital` (Capital Pipeline), `/roles` (Roles), `/launch` (Riptide v. External Launch), `/ecm` (ECM), `/account-settings`. All return 200 with a Wix login wall. Title on all is just "Riptide Advisors".

### Wix system pages (no content of ours)

`/service-page`, `/booking-calendar/*`, `/booking-form`, `/cart-page`, `/checkout`, `/thank-you-page`, plus lightboxes `popup-b9283` (Custom Login), `popup-znayv` (Instagram Feed Expand), `popup-dekfy` (Side Cart).

---

## 4. Internal links by page

| Page | Links out to |
|---|---|
| `/` | `/contact` (Get Started, Contact Now), `/principles` (Learn More), `/for-portfolio-managers` ×2, `/for-investors` ×2, team LinkedIns (Tyler Errickson, Spencer Gantsoudes, Andrew Heinemann), `mailto:info@riptide-advisors.com?subject=Information Request` |
| `/for-investors` | `/meet-our-managers` (members-only), `/contact` ×2 |
| `/for-portfolio-managers` | `/idea-hub` (members-only), `/contact` ×2 |
| `/our-principles` | `/contact` |
| `/contact` | — (forms only) |
| `/risk` | — (iframe only) |
| `/english-privacy-policy` | `support.wix.com/en/article/creating-a-privacy-policy` |
| `/about` | `/services` |
| `/services` | `/contact` |
| `/home1` | `/about` ×2, `/contact` |
| `/book-online` | `/service-page/strategy-consultation`, `/booking-calendar/investment-workshop`, `/booking-calendar/portfolio-review` |
| `/service-page/*` | `/`, `/book-online` |
| Header / footer | see §2 |

---

## 5. Forms

Both forms are on `/contact`, built with **Wix Forms** (`wix.form_app.form`). There are no forms on any other public page.

**Where submissions go today:** stored in Wix Forms submissions; First Name / Last Name / Email are upserted into **Wix Contacts (CRM)**; each form also triggers a **Wix Automation** (IDs `d019396a…` PM, `928a4452…` Allocator). These are probably email notifications, but the recipients aren't visible from outside, so check Dashboard → Automations. After submitting, the visitor sees an inline "Thanks for submitting!" message (no redirect). Spam protection is set to "ADVANCED".

### Form A — "Portfolio Manager Form" (section heading: PORTFOLIO MANAGERS)

| Field | Type | Required | Options |
|---|---|---|---|
| First Name | text | yes | |
| Last Name | text | yes | |
| Email | email | yes | |
| Strategy | checkbox group | yes (≥1) | Fundamental L/S · Systematic · Tactical · Macro · Other |
| Current Role | checkbox group | yes (≥1) | Employed (Buy-Side) · Employed (Sell-Side) · Running PA · Running Fund · Other |
| Peak AUM/Risk Capital | text | yes | |
| Current Prime Broker | text | yes | |
| Stock/Investment Idea | text | yes | |
| Strategy Description | textarea | yes | |
| How can Riptide help you? | textarea | yes | |
| *Submit* | button | | |

### Form B — "Allocator Form" (section heading: INVESTORS)

| Field | Type | Required | Options |
|---|---|---|---|
| First Name | text | yes | |
| Last Name | text | yes | |
| Email | email | yes | |
| Allocator Type | checkbox group | yes (≥1) | Institutional · RIA · Family Office · HNW/Individual · Other |
| Title | checkbox group | yes (≥1) | CEO · CIO · Analyst · Wealth Owner/Individual · Other |
| Mandate | checkbox group | yes (≥1) | Multi-Strategy Funds · Hedge Funds (Direct) · Special Situations · Other |
| Investment Size | text | yes | |
| How can Riptide help you? | textarea | yes | |
| *Submit* | button | | |

Phase 4 note: HubSpot needs custom contact properties for the checkbox groups (multi-checkbox type) and text fields. Export historical submissions from Wix before cutover if you want them in HubSpot.

---

## 6. Images

Riptide-owned images (14) were downloaded at original resolution to `public/images/` with semantic names. The full mapping, alt text and license notes are in `migration/image-manifest.csv`.

| Page | Images |
|---|---|
| All (header/footer/meta) | logo-horizontal-color.png, logo-horizontal-white.png, logo-mark.png (favicon), og-default.png |
| `/` | home-hero-banner.png ⚠, icon-capital-solutions.png ⚠, icon-operating-solutions.png ⚠, team-tyler-errickson.png, team-spencer-gantsoudes.png, team-andrew-heinemann.jpg, logo-horizontal-color-600.png (og:image), logo-stacked-color.png; four "Specialities" icons are Wix vector shapes (rebuild as SVG icons) |
| `/for-investors` | for-investors-banner.jpg ⚠ (Freepik) |
| `/for-portfolio-managers` | for-portfolio-managers-banner.png ⚠ |
| `/contact` | Wix stock "Signing a Contract" ✗ |
| `/our-principles`, `/principles` | Wix stock ✗ ×6 ("Waves On Beach", "Ocean Waves Aerial", "Abstract Water Surface", "Ocean", "Ocean Waves Crashing", "Coast") |
| `/services` | Wix stock ✗ ×2 ("Meeting", "Stock Market Quotes") |
| `/about` | Wix stock ✗ ×1 |
| `/home1` | Wix stock / Unsplash-via-Wix ✗ ×4 |
| `/book-online`, `/service-page/*` | Wix Bookings template images ✗ ×3 |

⚠ = Riptide upload, provenance unconfirmed · ✗ = Wix media library, not downloaded (not licensed for use outside Wix). These are left as `<!-- STOCK IMAGE … -->` placeholders in `content/`.

---

## 7. Embeds

| Page | Embed | Notes |
|---|---|---|
| `/risk` | Wix HTML iframe → `www-riptide-advisors-com.filesusr.com/html/fbd737_c8f3ae1e….html` | "Maximum Leverage Calculator": a self-contained 114 KB HTML/CSS/JS app (inputs, leverage frontier chart, confidence sensitivity, model caveats). It already has its own light/dark token set. Source saved to `content/risk.leverage-calculator.html`, to be ported to a React component in Phase 3. It will no longer load once Wix is gone. |

---

## 8. Third-party scripts

**No analytics or marketing tags are installed.** I found no Google Analytics/GA4, Google Tag Manager, Meta Pixel, LinkedIn Insight, Hotjar, Clarity, or HubSpot. Wix's tag manager (`siteTags.bundle`) loads but has nothing configured.

Scripts that load today are all Wix platform scripts. None of them carries over:

| Script / host | Purpose |
|---|---|
| `static.parastorage.com/services/wix-thunderbolt/*` | Wix renderer |
| `static.parastorage.com/services/tag-manager-client/*/siteTags.bundle.min.js` | Wix marketing-tag manager (empty) |
| `static.parastorage.com/unpkg/react@18.3.1`, `react-dom`, `lodash`, `core-js-bundle`, `focus-within-polyfill` | Wix runtime libraries |
| `browser.sentry-cdn.com/7.120.3/*` | Wix's own error monitoring |
| `frog.wix.com`, `panorama.wixapps.net` | Wix built-in analytics / performance beacons (the only "analytics" today; Wix dashboard stats) |
| `fonts` via `static.parastorage.com/tag-bundler/.../googlefont/poppins` | Poppins font |
| `www-riptide-advisors-com.filesusr.com` | /risk HTML embed host |

So for Phase 4 there are no existing tracking scripts to carry over. If you want analytics on the new site (Vercel Analytics, GA4, the HubSpot tracking code that comes with HubSpot forms, or LinkedIn Insight), that's a new addition and I'll wait for your approval.
