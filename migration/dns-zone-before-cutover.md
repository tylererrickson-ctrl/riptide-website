# riptide-advisors.com — DNS zone snapshot BEFORE cutover

Captured 2026-10-17 from the GoDaddy DNS Records page (all 37 records), immediately before the
Wix → Vercel switch. **Rollback = restore the two rows marked CHANGED to the values here.**

| Type | Name | Data | TTL | Cutover |
|---|---|---|---|---|
| A | @ | 185.230.63.107 | 1 Hour | **CHANGED** (Wix → Vercel) |
| NS | @ | ns53.domaincontrol.com. | 1 Hour | |
| NS | @ | ns54.domaincontrol.com. | 1 Hour | |
| CNAME | autodiscover | autodiscover.outlook.com. | 1 Hour | |
| CNAME | bounces.cloud2.em | cbounces.cloud2.em.secureserver.net. | 600 s | |
| CNAME | enterpriseenrollment | enterpriseenrollment-s.manage.microsoft.com. | 1 Hour | |
| CNAME | enterpriseregistration | enterpriseregistration.windows.net. | 1 Hour | |
| CNAME | lyncdiscover | webdir.online.lync.com. | 1 Hour | |
| CNAME | s1._domainkey | s1._domainkey.riptide-advisors.com.s020.ascendbywix.com. | 1 Hour | |
| CNAME | s2._domainkey | s2._domainkey.riptide-advisors.com. | 1 Hour | |
| CNAME | sable.cloud2._domainkey | dkim.cloud2.em.secureserver.net. | 600 s | |
| CNAME | sel1._domainkey | sel1._domainkey.riptide-advisors.com.s020.ascendbywix.com. | 1 Hour | |
| CNAME | selector1._domainkey | selector1-riptideadvisors-com01i._domainkey.riptideadvisors.y-v1.dkim.mail.microsoft. | 1 Hour | |
| CNAME | selector2._domainkey | selector2-riptideadvisors-com01i._domainkey.riptideadvisors.y-v1.dkim.mail.microsoft. | 1 Hour | |
| CNAME | sg | sg.riptide-advisors.com.s020.ascendbywix.com. | 1 Hour | |
| CNAME | sip | sipdir.online.lync.com. | 1 Hour | |
| CNAME | www | pointing.wixdns.net. | 1 Hour | **CHANGED** (Wix → Vercel) |
| CNAME | _domainconnect | _domainconnect.gd.domaincontrol.com. | 1 Hour | |
| SOA | @ | Primary nameserver: ns53.domaincontrol.com. | 1 Hour | |
| MX | @ | us-smtp-inbound-1.mimecast.com. (Priority 0) | 1 Hour | |
| MX | @ | us-smtp-inbound-2.mimecast.com. (Priority 5) | 1 Hour | |
| MX | send | feedback-smtp.us-east-1.amazonses.com. (Priority 10) | 1 Hour | |
| MX | send.notify | feedback-smtp.us-east-1.amazonses.com. (Priority 10) | 1 Hour | |
| TXT | @ | 231a9ae6-ee9b-81a2-a893-0070618e66fc | 1/2 Hour | |
| TXT | @ | 231a9ae6-ee9b-81f3-884d-0070512da32d | 1/2 Hour | |
| TXT | @ | v=verifydomain MS=6060815 | 1 Hour | |
| TXT | dc-fd741b8612._spfm.send | v=spf1 include:amazonses.com ~all | 1 Hour | |
| TXT | dc-fd741b8612._spfm.send.notify | v=spf1 include:amazonses.com ~all | 1 Hour | |
| TXT | mimecast20260324._domainkey | v=DKIM1; k=rsa; p=MIIBIjANBgkq…(Mimecast DKIM public key) | 1 Hour | |
| TXT | resend._domainkey | p=MIGfMA0GCSq…(Resend DKIM public key) | 1 Hour | |
| TXT | resend._domainkey.notify | p=MIGfMA0GCSq…(Resend DKIM public key) | 1 Hour | |
| TXT | send | v=spf1 include:dc-fd741b8612._spfm.send.riptide-advisors.com ~all | 1 Hour | |
| TXT | send.notify | v=spf1 include:dc-fd741b8612._spfm.send.notify.riptide-advisors.com ~all | 1 Hour | |
| TXT | _dmarc | v=DMARC1; p=none; rua=mailto:dmarc-reports@riptide-advisors.com; ruf=mailto:dmarc-failures@riptide-advisors.com; fo=1; aspf=r; adkim=r; | 1/2 Hour | |
| TXT | _notion-dcv.www | 255a9ae6-ee9b-8148-823d-007082ee0d1f | 1 Hour | |
| SRV | _sip._tls.@ | 100 1 443 sipdir.online.lync.com. | 1 Hour | |
| SRV | _sipfederationtls._tcp.@ | 100 1 5061 sipfed.online.lync.com. | 1 Hour | |

Notes found while capturing (not visible in public lookups when cutover.md was written):
- Mimecast DKIM (`mimecast20260324._domainkey`), Resend sending records (`send`, `send.notify`,
  `resend._domainkey*` — Riptide Analytics' mail), GoDaddy email-marketing (`*.cloud2*`), and
  Wix `sg`/`sel1` records all exist. None are touched by the cutover.
- Still no SPF on the apex (`@`). See cutover.md §8.
