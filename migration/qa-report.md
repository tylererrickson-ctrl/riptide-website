# QA report (Phase 6, 2026-10-17)

Tested on a local production build (`next build && next start`) and on staging
(https://riptide-advisors-staging.vercel.app). Pages: `/`, `/for-portfolio-managers`, `/for-investors`,
`/our-principles`, `/risk`, `/contact`, `/about`, `/services`, plus the 404 page and the open disclaimer gate.

## Build and static checks
| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ no errors |
| `npm run lint` (ESLint, Next core-web-vitals + TS + React Compiler rules) | ✅ no errors or warnings |
| `npm run build` (incl. prebuild indexing guard) | ✅ |
| Indexing guard: production without `SITE_INDEXABLE=true` | ✅ build fails, as intended |

## Accessibility
- **axe-core 4.10 (WCAG 2.0/2.1/2.2 A + AA + best practice):** 0 violations on every page at 375 px and 1440 px,
  in light and dark themes, plus the open gate. The scanner was confirmed working: it flagged all planted
  issues on a deliberately broken control page.
- **Hero text over the photo** (which axe can't measure): measured from rendered pixels at 1440/1024/768/375.
  It first failed (subheading 2.6–2.9:1, mobile buttons 2.0:1). **Fixed** with a stronger scrim and lighter secondary ink;
  every element now passes (smallest margin 5.25:1 against a 4.5:1 requirement).
- **Fixed:** scroll-reveal "dim" states (statement words, stepper steps) were below contrast; they now use the muted ink color (6.4:1).
- Keyboard: skip link; menu and gate trap focus; Esc closes the menu (deliberately not the gate); focus returns to
  the trigger; form errors are announced (`role=alert`) and focused; tabs use arrow keys; visible focus ring everywhere.
- `prefers-reduced-motion`: all animation off, scroll effects become static layouts, intro skipped.

## Lighthouse 12.8 (local production build)
| Page | Mobile perf | Desktop perf | A11y | Best practices | SEO* |
|---|---|---|---|---|---|
| / | 88 | 99 | 100 | 100 | 69 |
| /for-portfolio-managers | 97 | 99 | 100 | 100 | 61 |
| /for-investors | 85 | 99 | 100 | 100 | 61 |
| /our-principles | 91 | 98 | 100 | 100 | 61 |
| /risk | 96 | 100 | 100 | 100 | 61 |
| /contact | 94 | 99 | 100 | 100 | 61 |
| /about | 80 | 99 | 100 | 100 | 61 |
| /services | 89 | 99 | 100 | 100 | 61 |

\*SEO scores are capped here **by design**. Non-production builds are noindex (`is-crawlable` fails), and the
Wix pages had no meta descriptions to carry over (`meta-description`). On production with descriptions added, SEO should reach 100.
CLS is 0.000 everywhere (0.005 on /for-investors desktop). Mobile scores use Lighthouse's simulated slow 4G and a 4× CPU slowdown.

**Fixed during QA:**
- Console errors from prefetching `/analytics`, a cross-origin redirect. Links to redirected paths no longer prefetch.
- The wave animation now starts after the page is idle and runs at 30 fps on phones. This cut principles-page blocking time from 1,030 ms to 38 ms in Lighthouse.

## Responsive (375 / 768 / 1440, light + 1440 dark)
- Automated: no horizontal overflow and no console errors on any page at any width (32 page/width/theme combinations).
- Visual review of every page:
  - **Fixed:** list bullets were missing in principles, legal and gate text (stripped by Tailwind's base reset).
  - **Accepted:** calculator toggle labels wrap to two lines at 375 px. They stay readable and tappable.

## Redirects
`scripts/verify-redirects.mjs` passes on local and staging: all 28 CSV rows, trailing-slash 301s, and real 404s.
(`/english-privacy-policy` is expected to 404 until the policy is published. See compliance-checklist.md.)

## Not covered / outstanding
- Compliance content (see `migration/compliance-checklist.md`). That copy will need an accessibility re-check once it's in.
- Manual screen-reader pass (NVDA / VoiceOver). Automated checks are clean, but a 20-minute manual pass before launch is recommended.
- Real-device testing (iOS Safari, Android Chrome). Everything above is from Chromium emulation.
