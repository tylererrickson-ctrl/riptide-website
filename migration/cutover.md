# Phase 7 — Cutover plan: Wix → Vercel

**Status: EXECUTED 2026-10-17** (at Tyler's instruction, via his signed-in GoDaddy/Vercel/Google sessions).
Log: Vercel Pro active · prod env set (`SITE_INDEXABLE`, `NEXT_PUBLIC_SITE_URL`, `GOOGLE_SITE_VERIFICATION`) ·
domains added (www primary, apex 308 → www) · Sanity CORS + production webhook `OFrop1ec6Dbavzhr` ·
GoDaddy: `@` A → `216.150.1.1` + `216.150.16.1`, `www` CNAME → `587a21258fb16294.vercel-dns-017.com`
(Vercel's current recommended values, in place of the legacy 76.76.21.21 / cname.vercel-dns.com below) ·
Let's Encrypt certs issued · checks passed: redirects, indexing, revalidation, form → Notion, MX unchanged ·
Search Console property `https://www.riptide-advisors.com/` verified (HTML tag carried over from Wix) + sitemap submitted.
Pre-cutover zone: `dns-zone-before-cutover.md`. Rollback = §5 with those values.
**Domain:** `riptide-advisors.com`. DNS is hosted at **GoDaddy** (nameservers `ns53.domaincontrol.com` / `ns54.domaincontrol.com`).
**Target:** Vercel project `riptide-advisors/riptide-website`, production branch `production`.

> **The golden rule:** you change exactly **two** DNS records, the apex `A` and the `www` `CNAME`.
> Every other record in the zone runs email (Microsoft 365 + Mimecast), Teams/Skype, device enrollment
> or domain verification. **Do not edit, delete or "clean up" anything else on cutover day.**

---

## 1. Current DNS zone (snapshot taken 2026-10-17 from public DNS)

Before changing anything, export the full zone from GoDaddy (**Domain → DNS → ⋯ → Export zone file**) and save it beside this doc as `migration/dns-zone-before-cutover.txt`. Public lookups can't see every record, so the GoDaddy export is the source of truth.

| Host | Type | Value | TTL | Purpose | Action |
|---|---|---|---|---|---|
| `@` | A | `185.230.63.107` | 3600 | Wix website | **CHANGE** (see §3) |
| `www` | CNAME | `pointing.wixdns.net` | 3600 | Wix website | **CHANGE** (see §3) |
| `@` | MX 0 | `us-smtp-inbound-1.mimecast.com` | 3600 | Inbound email (Mimecast) | **DO NOT CHANGE** |
| `@` | MX 5 | `us-smtp-inbound-2.mimecast.com` | 3600 | Inbound email (Mimecast) | **DO NOT CHANGE** |
| `@` | TXT | `v=verifydomain MS=6060815` | 1800 | Microsoft 365 domain verification | **DO NOT CHANGE** |
| `@` | TXT | `231a9ae6-ee9b-81a2-a893-0070618e66fc` | 1800 | Domain verification (likely Notion) | **DO NOT CHANGE** |
| `@` | TXT | `231a9ae6-ee9b-81f3-884d-0070512da32d` | 1800 | Domain verification (likely Notion) | **DO NOT CHANGE** |
| `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:dmarc-reports@…; ruf=mailto:dmarc-failures@…; fo=1; aspf=r; adkim=r;` | 1800 | DMARC | **DO NOT CHANGE** |
| `selector1._domainkey` | CNAME | `selector1-riptide-advisors-com._domainkey.riptideadvisors.y-v1.dkim.mail.microsoft` | 3600 | DKIM (Microsoft 365) | **DO NOT CHANGE** |
| `selector2._domainkey` | CNAME | `selector2-riptide-advisors-com._domainkey.riptideadvisors.y-v1.dkim.mail.microsoft` | 3600 | DKIM (Microsoft 365) | **DO NOT CHANGE** |
| `s1._domainkey` | CNAME | `…ascendbywix…` | 3600 | DKIM (Wix email marketing) | **DO NOT CHANGE on cutover day** (see §8) |
| `s2._domainkey` | CNAME | `…ascendbywix…` | 3600 | DKIM (Wix email marketing) | **DO NOT CHANGE on cutover day** (see §8) |
| `autodiscover` | CNAME | `autodiscover.outlook.com` | 3600 | Outlook setup | **DO NOT CHANGE** |
| `enterpriseregistration` | CNAME | `enterpriseregistration.windows.net` | 3600 | Entra device registration | **DO NOT CHANGE** |
| `enterpriseenrollment` | CNAME | `enterpriseenrollment-s.manage.microsoft.com` | 3600 | Intune enrollment | **DO NOT CHANGE** |
| `lyncdiscover` | CNAME | `webdir.online.lync.com` | 3600 | Teams/Skype | **DO NOT CHANGE** |
| `sip` | CNAME | `sipdir.online.lync.com` | 3600 | Teams/Skype | **DO NOT CHANGE** |
| `_sip._tls` | SRV | `100 1 443 sipdir.online.lync.com` | 3600 | Teams/Skype | **DO NOT CHANGE** |
| `_sipfederationtls._tcp` | SRV | `100 1 5061 sipfed.online.lync.com` | 3600 | Teams federation | **DO NOT CHANGE** |
| `_domainconnect` | CNAME | `_domainconnect.gd.domaincontrol.com` | 3600 | GoDaddy | **DO NOT CHANGE** |
| (anything else in the export) | | | | | **DO NOT CHANGE** |

**No SPF record exists today.** Don't add one on cutover day (see §8).

---

## 2. Pre-cutover checklist (1–2 weeks before)

**Vercel**
- [ ] Upgrade the `riptide-advisors` team to **Pro**. Hobby is for non-commercial use only.
- [ ] Merge the reviewed work into `main`, then fast-forward `production` to it. The production deploy should be green at `riptide-website-*.vercel.app`.
- [ ] Production environment variables (**Settings → Environment Variables → Production**):
  - `SITE_INDEXABLE=true`. The prebuild check fails the production build without it.
  - `NEXT_PUBLIC_SITE_URL=https://www.riptide-advisors.com`
  - Confirm that `NEXT_PUBLIC_SANITY_*`, `SANITY_API_READ_TOKEN`, `SANITY_WEBHOOK_SECRET`, `GATE_LOG_SALT`, `SANITY_API_WRITE_TOKEN` and `NOTION_*` are all set for Production, not only Preview.
- [ ] **Settings → Domains → Add** `www.riptide-advisors.com` and `riptide-advisors.com`. Make **www primary** and set the apex to **redirect (308/301) → www**. Vercel then shows the exact DNS values to use. Copy them into §3 if they differ from the defaults.

**Sanity** (manage.sanity.io → project `nzbi6pul`)
- [ ] API → CORS origins: add `https://www.riptide-advisors.com` (allow credentials) and `https://riptide-advisors.com`.
- [ ] API → Webhooks: add a **production** webhook with URL `https://www.riptide-advisors.com/api/revalidate`, the same filter, projection and secret as the staging one, and **no** `x-vercel-protection-bypass` header. Keep the staging webhook.

**Compliance (blocking)**
- [ ] Privacy policy published, with the `/english-privacy-policy` redirect target updated.
- [ ] Form ADV / CRS links and the footer disclosure text approved.
- [ ] Remove the bracketed `[is a registered investment adviser / relies on an exemption…]` clause in the `/rof` gate. The factsheet says ERA.
- [ ] Replace the site-disclaimer placeholder.
- [ ] Written compliance sign-off on `/rof`, covering fund performance behind the qualified-purchaser gate.

**Content and data**
- [ ] Final content review on staging; nothing left in "Awaiting review".
- [ ] Export historical Wix form submissions (Wix → Contacts / Forms → Export CSV) and archive them.
- [ ] Download any Wix assets you want to keep (blog images, PDFs).

**DNS prep (48 hours before)**
- [ ] In GoDaddy, lower the TTL on **only** the `@` A record and the `www` CNAME to **600** (10 minutes). Rollback is then fast. Leave every other TTL alone.
- [ ] Export and save the zone file (§1).

---

## 3. Cutover day (≈15 minutes of work)

Pick a quiet window (e.g. a weekday evening ET). Have the GoDaddy DNS page and the Vercel Domains page open side by side.

1. **GoDaddy → DNS → `@` A record → Edit.** Change `185.230.63.107` to **`76.76.21.21`** (or the IP Vercel shows). TTL 600. Save.
   - If GoDaddy lists more than one `@` A record, delete only the extra Wix ones. Leave exactly one A record pointing at Vercel.
2. **GoDaddy → DNS → `www` CNAME → Edit.** Change `pointing.wixdns.net` to **`cname.vercel-dns.com`** (or the value Vercel shows). TTL 600. Save.
3. **Don't touch anything else.** Re-read §1 if tempted.
4. **Vercel → Settings → Domains.** Wait for both domains to show **Valid Configuration** and for the SSL certificates to issue. This is usually 5–30 minutes. Vercel issues the certificates automatically.
5. **Wix → Settings → Domains.** Leave the domain connected for now. Don't disconnect it or transfer anything. Wix will warn that the domain no longer points at it; ignore the warning.

## 4. Post-cutover checks (the same hour)

Run these in order. Use a private browser window so cached Wix pages don't fool you.

- [ ] `https://www.riptide-advisors.com` loads the new site with a valid padlock.
- [ ] `http://riptide-advisors.com` and `https://riptide-advisors.com` both 301/308 to `https://www.riptide-advisors.com/`.
- [ ] **Email:** send a message *to* tyler@riptide-advisors.com from an outside account (Gmail), and send one *out*. Both should arrive. Check that Teams and Outlook still work. If email breaks, you changed something other than the two records in §3.
- [ ] **Forms:** submit the Portfolio Manager form and the Investor form on `/contact`. Rows should appear in **PM Pipeline** and **Website Inquiries — Investors** in Notion. Delete the test rows afterwards.
- [ ] **Redirects:** from the repo, run:
  ```bash
  node scripts/verify-redirects.mjs https://www.riptide-advisors.com
  ```
  Every old Wix URL should return its expected 301 or 200. Once the privacy policy is live, update the `/english-privacy-policy` row in `migration/redirects.csv`.
- [ ] **Indexing:** `https://www.riptide-advisors.com/robots.txt` allows crawling and lists the sitemap. The page source has **no** `noindex`. `/studio` is still noindex.
  ```bash
  curl -sI https://www.riptide-advisors.com | grep -i x-robots
  ```
  This should print nothing.
- [ ] **CMS:** publish a small edit in `/studio` and check that it's live within about a minute.
  ```bash
  node scripts/check-revalidation.mjs https://www.riptide-advisors.com
  ```
- [ ] **Gate:** `/rof` shows the qualified-purchaser notice. "I Do Not Agree" leaves the page. "I Agree" shows the content.
- [ ] **Search Console:** add the `https://www.riptide-advisors.com` property (verify with a DNS TXT record. This is the one record you **add**; don't remove any existing TXT). Submit `https://www.riptide-advisors.com/sitemap.xml`. Then use **URL inspection → Request indexing** for the home page.
- [ ] **LinkedIn and other profiles:** confirm the links still resolve. They should, because the domain is unchanged.

## 5. Rollback (if something is badly wrong)

DNS is the only switch, so rollback takes about 10 minutes thanks to the 600s TTL:

1. GoDaddy: set `@` A back to **`185.230.63.107`**.
2. GoDaddy: set `www` CNAME back to **`pointing.wixdns.net`**.
3. Wix is still paid for and still connected, so the old site comes straight back.

Email is unaffected either way, because MX, DKIM and DMARC were never touched.

## 6. After a clean cutover

- **Day 1–3:** watch Vercel → Logs for 404s and add any missing old URLs to `redirects.csv`. Watch Notion for real form submissions.
- **Week 1:** raise the `@` and `www` TTLs back to 3600.
- **Week 2–4:** check Search Console coverage. Old Wix URLs should move to "Page with redirect".
- **Do not cancel the Wix plan until 2–4 weeks after a clean cutover.** It's your instant rollback. Before cancelling:
  - make sure the domain is **registered at GoDaddy**, not Wix. Check GoDaddy → My Products. If it's registered through Wix, transfer it first;
  - check whether any Wix email-marketing campaigns still send. They use the `s1`/`s2` DKIM records.

## 7. Who owns what afterwards

| Thing | Where | Who |
|---|---|---|
| Page content, team, disclaimers | `www.riptide-advisors.com/studio` (Request review → Approve → Publish) | Content editors, with a second approver |
| Form leads | Notion: PM Pipeline / Website Inquiries — Investors | Tyler / team |
| Code and design | GitHub `tylererrickson-ctrl/riptide-website`. Push to `production` to deploy | Developer |
| Hosting, SSL, domains | Vercel `riptide-advisors/riptide-website` | Tyler |
| DNS and email records | GoDaddy | Tyler / IT |

## 8. Separate email-hygiene items (NOT part of cutover; do them later, with IT)

These are real gaps, but changing them mixes website risk with email risk. Do them in a separate change window:

- **No SPF record.** Mail from the domain can be spoofed and some recipients mark it as spam. A typical Microsoft 365 + Mimecast SPF is `v=spf1 include:spf.protection.outlook.com include:_netblocks.mimecast.com ~all`. **Confirm the exact includes with whoever runs Mimecast and M365 before adding it.** There must be only one SPF TXT record.
- **DMARC is `p=none`.** Once SPF and DKIM pass in the DMARC reports, step up to `p=quarantine`.
- **Wix `s1`/`s2` DKIM CNAMEs.** Remove them only after Wix is cancelled and nothing sends through Wix email marketing.
