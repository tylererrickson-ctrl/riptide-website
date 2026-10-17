# Design reference: argan.ai → Riptide

**Direction (2026-10-17):** use argan.ai for inspiration. Replicate its *structure, design language,
and interaction patterns* without infringing copyright.

## Clean-room rules

argan.ai is proprietary ("© 2026 copyright argan technologies b.v."). Layout ideas, page structure
and interaction patterns are not protected by copyright. Their specific expression is. So:

| We may | We may not |
|---|---|
| Use the same *kinds* of sections, grid rhythm, scroll behaviors, gate flow, type hierarchy | Copy their HTML, CSS, JS, Tailwind class strings, or component code |
| Write our own components from this written spec | Read their bundle while writing our code (this doc is the only hand-off) |
| Pick a similar *category* of type (tight grotesk + mono labels) | Use their fonts as a pair (Inter Tight + Roboto Mono), their logo, tree/NINA artwork, photos, or copy |
| Have a disclaimer gate that behaves like theirs | Reuse their disclaimer wording. Ours comes from Riptide compliance |
| Use bracketed mono CTAs as a pattern | Reuse their exact strings ("enter the flagship", "let's talk ↗", "the numbers.") |

All imagery is ours or properly licensed. Generative visuals are our own code (see the wave field below).

---

## 1. What argan does (observed 2026-10-17)

### Global
- **Palette:** warm cream background, near-black ink, one hot accent (orange) used *only* for interactive
  affordances (brackets, "contact us", accept buttons). Dark sections invert to ink with cream text.
- **Type:** very large, tightly tracked grotesk display headlines (≈ 6–7vw, line-height ~0.95),
  tiny uppercase letter-spaced monospace "micro" labels for metadata, mid-size grotesk body.
- **Grid:** 4vw side gutters; content often pushed to the left half or right half (asymmetry);
  1px hairline rules everywhere (`border-ink/10`).
- **Section rails:** each section opens with a hairline and a mono label row:
  `02 — EDGE` on the left, a breadcrumb-like caption on the right.
- **Bracket CTAs:** `[ label ]` in mono uppercase with an arrow `→` aligned to the far edge.
- **Tags/chips:** small bordered mono pills `[ ALL-WEATHER ]`.
- **Fixed header:** transparent over hero, gains a solid background + hairline on scroll; logo,
  inline nav links (desktop), accent "contact us" bracket, and a `menu ≡` button opening a full overlay.
- **Intro loader:** once per browser session, a dark screen with the logo mark and a progress counter
  (`100 · SYSTEMATIC MACRO`), then wipes away. Session flag prevents repeat.
- **Cookie banner:** bottom-right card, `[ settings ]` / `[ okay ]`, remembered in localStorage.
- **Footer:** address, page links, social, newsletter email + subscribe, oversized logo lockup,
  legal row (© · privacy · cookie settings · disclaimer), and a regulatory warning strip.

### Home ("portal")
- One viewport (100svh). Full-bleed atmospheric image with subtle pointer/scroll parallax.
- Statement H1 in two lines. Micro label above it.
- Two equal panels in a 2-col grid separated by hairlines: index number (`01`), right-aligned meta
  (`FLAGSHIP STRATEGY · EST 2024`), large product name, mono tagline, bottom bracket CTA + arrow.
  Hover brightens the panel and slides the arrow.
- A slim third row linking to the research hub, then a micro footer.
- Mobile: panels stack; everything still fits the viewport.

### Product pages (/agentic, /opportunistic)
1. **Hero:** giant headline on the left, generative artwork (animated particle tree on canvas) on the right,
   short "seek" statement, and a 2-row key-stat table (label / value) separated by hairlines.
2. **Pinned statement:** a big sentence pinned while the user scrolls; words fade from grey to ink as scroll progresses.
3. **Two-column explainer:** label at left, paragraph + bracket tags at right.
4. **Sticky illustration + text swaps:** illustration pinned on one side while text blocks swap on the other.
5. **Process stepper:** horizontal line with 5 nodes. Nodes fill and step text un-greys sequentially on scroll.
6. **Origin timeline:** horizontally scrolled chapters driven by vertical scroll. Each has a giant
   faded year numeral behind it, a `| 2021 · 2024 |` micro tag, title and paragraph, and an `01 / 04` progress indicator.
7. **Full-bleed image band**, then a **stacked-bars graphic** that grows on scroll.
8. **Dark performance teaser:** "explore the full performance breakdown →" row and a giant count-up number (`+62.42%`).
9. **Dark objectives list:** rows of title (left) + explanation (right), separated by hairlines.
10. **Marquee ticker** of key attributes, looping horizontally.
11. **Pull quote** with oversized accent quote mark and attribution micro label.
12. **"Let's talk" CTA** block and the investor-only note.

### Performance page
- "the numbers." headline, then summary stats + line chart (strategy vs. benchmark), monthly returns table
  with **sticky first column** and highlighted YTD column, heat-tinted cells, legend chips, rolling-window
  charts, risk-statistics table, footnotes in small grey text, and a "questions about the numbers? contact us →" row.

### Contact page
- "contact us." headline, short intro, form in filled grey inputs (name, email, country, investor type
  select, intended first investment, message, consent checkbox), black submit, small regulatory note.
- Generative line art beside the form.
- FAQ accordion ("questions, answered."), document download row ("download the … ↓"), office photo + map.

### Disclaimer gate (to be replicated in behavior)
| Behavior | argan |
|---|---|
| Where | Only on product sections (/agentic/*, /opportunistic/*) and /contact. **Not** on home or research. |
| Scope | Per product. Accepting the agentic notice covers /agentic/performance but **not** /opportunistic, which has its own, longer notice. |
| Versioning | Acceptance is stored as a version (`v3`). Changing the text forces everyone to accept again. |
| Persistence | `sessionStorage`, so the notice comes back each new browser session. |
| UI | Full-screen dimmed and blurred backdrop over the real page. Centered card with a mono header ("LEGAL DISCLAIMER" + mark), large H2, a mono instruction line, a scrollable body of H3 sections, and a sticky footer with the entity/location on the left and an accent `[ ACCEPT & ENTER SITE ]` on the right. |
| Blocking | Page scroll locked. No close button. Esc does not dismiss. `role="dialog"`, `aria-modal="true"`. |
| Re-open | Footer "disclaimer" button re-opens it at any time. |
| Weak spots we'll improve | Focus is not moved into the dialog and there's no focus trap. Accept is enabled before reading. There's no decline path. There's no record of who accepted. |

---

## 2. Riptide mapping

### Visual system (to be tokenized in Phase 3)
- **Light mode:** "sea-salt" off-white background (cool, not cream), deep-navy ink, hairlines at ink/10.
- **Dark mode:** abyssal navy background (not black), sea-salt text. Dark *sections* in light mode reuse the dark tokens.
- **Brand blues** (from the Riptide logo gradient): navy `#00336A`, tide `#1B76B9`, cyan `#00A9D8`.
- **Single interaction accent:** warm amber/brass (already used in the /risk calculator), used only on
  interactive affordances, the way argan uses orange.
- **Fonts** (all SIL OFL via `next/font`, self-hosted):
  - Display/body: **Instrument Sans**, a tight modern grotesk with a different character from Inter Tight.
  - Micro labels: **JetBrains Mono**.
  - Quotes and principle epigraphs: **Instrument Serif** italic. This is the "richer" layer argan lacks.
- **Signature visual:** a generative **wave/current field** in canvas/WebGL (flowing lines that respond
  to pointer and scroll). It plays the role argan's particle tree plays, drawn from Riptide's wave mark. All original code.

### Page mapping (paths unchanged)
| Riptide page | argan pattern used |
|---|---|
| `/` | Portal hero (100svh, wave field + parallax, statement H1 "Uncorrelated returns driven by extraordinary people."). Two panels: **01 For Portfolio Managers** / **02 For Investors**. Third slim row: **Principles** (or Risk tools). Below the fold, sectioned with rails: About (`01 — ABOUT`), Philosophy as a pinned statement, Specialities as bracket tags or objectives rows, Team grid, Connect. |
| `/for-portfolio-managers` | Product-page template: hero + key-stat table; pinned statement; **process stepper** = the progression *Riptide Opportunities Fund → Flexible Capital Fund → Custom Managed Accounts*; service providers as a dark objectives-style list; "Scaling investment strategies" as explainer rows; marquee of attributes; CTA. |
| `/for-investors` | Product-page template, **behind the disclaimer gate**: hero; Multi-Manager Funds explainer with bracket tags; Custom Managed Accounts explainer; dark objectives list; CTA to /contact and /meet-our-managers. |
| `/our-principles` | **Origin timeline** pattern. The five principles (Earn Trust, Create Alignment, Build Lasting Partnerships, Play to Win, Improve Constantly) become horizontally scrolled chapters with giant faded numerals `01`–`05` and the epigraph in Instrument Serif. |
| `/risk` | **Performance-page** pattern. "the numbers." style headline adapted to the leverage calculator, rebuilt in React with the same layout language (stat blocks, frontier chart, sensitivity table with sticky first column, caveats in footnote style). Gated if compliance wants. |
| `/contact` | Contact pattern: headline, two forms (PM / Allocator) as a **tab switch** above the filled-input form (HubSpot in Phase 4), consent note, Greenwich office block (no third-party map unless approved). FAQ accordion only if you supply FAQs. |
| `/english-privacy-policy` & legal | Plain long-form text page with section rail. Wording supplied by compliance, verbatim. |
| Global | Fixed header with scroll state, full-screen menu overlay, once-per-session intro loader with the wave mark, footer with legal row + "disclaimer" re-open button + regulatory strip. A cookie banner is only added if we add non-essential cookies (e.g. HubSpot tracking). |

### Disclaimer gate: Riptide spec
Same behavior as argan, plus the fixes noted above:

1. **Content in Sanity.** A `disclaimer` document type with `title`, `scope` (e.g. `investors`, `site`,
   one per fund), body (portable text, H3 sections), accept label, optional decline URL, and
   **version** (auto-incremented on publish). Wording comes from compliance and goes through the
   publish-review workflow, verbatim.
2. **Which routes are gated** is set per page in Sanity (`gate: reference → disclaimer`). The proposed default
   is `/for-investors`, `/meet-our-managers` and the fund pages (`/rof`, `/rfcf`). The home page stays open. Your call.
3. **Persistence:** `sessionStorage` key per scope + version (matches argan), with an optional per-scope
   setting to switch to a 30-day cookie if compliance prefers.
4. **Accessibility (better than argan):** focus moves into the dialog and is trapped, the heading is
   labelled, background is `inert`, and scroll is locked. Esc does not close it, which is intentional and announced. Visible focus styles.
5. **Accept gating (optional):** accept is enabled only after the body has been scrolled to the end, if compliance wants that.
6. **Decline path:** `[ DECLINE ]` returns to `/` (argan has none).
7. **Audit trail (optional, recommended for an RIA):** on accept, POST `{scope, version, timestamp,
   hashed IP, user-agent}` to a Next.js route that writes to a log store. No personal data unless compliance wants it.
8. **SEO:** gated page content is still server-rendered (so crawlable). The gate is a client overlay, as on argan.
   If compliance needs the content *not* to be publicly crawlable, the page must instead render only after acceptance
   and be `noindex`. Your call.
9. **Footer "Disclaimer"** button re-opens the notice for the current scope.

### Interaction inventory (all to be built as React + CSS, no jQuery)
| # | Interaction | Implementation plan |
|---|---|---|
| 1 | Intro loader (once per session) | Client component, `sessionStorage` flag, CSS clip-path wipe; skipped if `prefers-reduced-motion` |
| 2 | Header scroll state + menu overlay | `IntersectionObserver` sentinel; overlay is a focus-trapped dialog |
| 3 | Hero wave field + parallax | Canvas 2D (or WebGL) in a client component; pauses offscreen; static SVG fallback for reduced motion |
| 4 | Portal panel hover | CSS only |
| 5 | Pinned statement word reveal | CSS `position: sticky` + scroll-progress hook driving per-word opacity |
| 6 | Sticky illustration / text swap | Sticky column + `IntersectionObserver` |
| 7 | Process stepper | Scroll-progress hook; nodes are `<ol>` items (semantic) |
| 8 | Horizontal timeline chapters | Sticky container + translateX driven by scroll progress; vertical stack on mobile and for reduced motion |
| 9 | Count-up number | `IntersectionObserver` + `requestAnimationFrame`; final value in the SSR markup |
| 10 | Stacked bars grow | CSS transform on reveal |
| 11 | Marquee ticker | CSS keyframes, duplicated track, `aria-hidden` copy, pauses on hover and for reduced motion |
| 12 | FAQ accordion | Native `<details>/<summary>` with CSS height animation |
| 13 | Tables with sticky first column | CSS `position: sticky` |
| 14 | Disclaimer gate | As specced above |
| 15 | Cookie banner | Only if needed (see Phase 4 tracking approval) |

All motion respects `prefers-reduced-motion`, and all content is in the server-rendered HTML (Phase 5 requirement).
