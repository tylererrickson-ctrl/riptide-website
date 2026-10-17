# riptide-advisors.com

Next.js 16 (App Router, Cache Components) + Sanity CMS, deployed on Vercel. Replaces the Wix site.

| Path | What |
|---|---|
| `migration/` | Phase 1 audit (inventory, redirects, image manifest), design reference, import notes |
| `content/` | Verbatim Markdown export of the Wix pages (source of the CMS import) |
| `src/app/(site)/[[...path]]` | Every CMS page, rendered at its original Wix path |
| `src/app/studio` | Embedded Sanity Studio at `/studio` |
| `src/sanity/` | Client, live/draft fetching, GROQ queries, schemas, review workflow |
| `src/components/` | Header, footer, section renderers, disclaimer gate, forms |
| `scripts/import-content.mjs` | Loads `content/` + `public/images/` into Sanity |
| `scripts/check-indexing.mjs` | Prebuild guard: fails a production build that would be noindex |

## Setup
```bash
cp .env.example .env.local   # fill in Sanity project id + tokens
npm install
npm run dev                  # http://localhost:3000, Studio at /studio
npm run content:import       # one-off: load the Wix export into Sanity
```

## Environments and indexing
- **Production** (`VERCEL_ENV=production`) must have `SITE_INDEXABLE=true`, or the build fails.
- **Staging / previews / local** are always served `noindex` (meta robots + `X-Robots-Tag`).
  Staging is a Vercel *preview* deployment with a stable alias. Don't use a production deployment for staging.

## Editing workflow
See [src/sanity/workflow/README.md](src/sanity/workflow/README.md): draft → request review → approve (by a second person) → publish.
Every publish is recorded permanently in the Studio's *Publish log*.
