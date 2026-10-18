// Privacy Policy, Website Disclaimer & Terms of Use, and footer disclosure (2026-10-17).
// Wording supplied verbatim by Tyler Errickson; placeholders filled: effective date October 17, 2026;
// [EMAIL] = info@riptide-advisors.com; [YEAR] rendered live by the footer. [PHONE] omitted (no number
// on file) — add it to the "Contact us" line when provided.
// Shared by import-content.mjs and the one-off API publish.

const EMAIL = "info@riptide-advisors.com";
export const LEGAL_EFFECTIVE_DATE = "2026-10-17";
const EFFECTIVE = "October 17, 2026";

let n = 0;
const k = () => `lg${(n++).toString(36).padStart(3, "0")}`;
const span = (text, marks = []) => ({ _type: "span", _key: k(), text, marks });
const p = (...parts) => {
  const markDefs = [];
  const children = parts.map((x) => {
    if (typeof x === "string") return span(x);
    if (x.href) {
      const key = k();
      markDefs.push({ _type: "link", _key: key, href: x.href });
      return span(x.text, [key]);
    }
    return span(x.text, ["strong"]);
  });
  return { _type: "block", _key: k(), style: "normal", markDefs, children };
};
const h2 = (text) => ({ _type: "block", _key: k(), style: "h2", markDefs: [], children: [span(text)] });
const b = (text) => ({ text });
const a = (text, href) => ({ text, href });

/** Numbered clause: heading + body paragraph. */
const clause = (title, ...body) => [h2(title), p(...body)];

export const PRIVACY_BODY = [
  p(b("Effective date: "), EFFECTIVE),
  ...clause("1. Who we are and what this covers",
    "This Privacy Policy explains how Riptide Advisors LLC and its affiliates, including Riptide Fund GP LLC and Riptide Services LLC (together, “Riptide,” “we,” “us”), collect, use and share personal information through riptide-advisors.com and related pages (the “Site”). Riptide is located at 12 Havemeyer Place, Greenwich, CT. This policy does not cover information we receive from investors in Riptide-managed funds through subscription documents or account servicing; that information is governed by our separate Privacy Notice to Investors (Section 9)."),
  ...clause("2. Information we collect",
    "We collect information you give us directly, such as your name, email address, phone number, firm, title and message when you complete a contact or inquiry form, request materials, or subscribe to updates. If you identify yourself as an investor or prospective portfolio manager, we may also collect information about your professional background or investor status. Our hosting provider automatically records limited technical information, such as IP address, browser type and pages requested, in standard server logs used for security and site operation."),
  ...clause("3. How we use information",
    "We use personal information to respond to inquiries, evaluate potential investor, manager or business relationships, send communications you request, operate, secure and improve the Site, comply with legal, regulatory and recordkeeping obligations, and protect our rights. We do not use Site information to make automated decisions that produce legal effects about you."),
  ...clause("4. How we share information",
    "We do not sell personal information, and we do not share it for cross-context behavioral advertising. We may share it with our affiliates; with service providers who support the Site and our business, such as hosting, CRM and email providers, under confidentiality obligations; with our fund administrator, legal, tax and compliance advisers where relevant to a relationship you initiate; with regulators, courts or law enforcement where required by law or to protect our rights; and with a successor in connection with a merger, acquisition or reorganization."),
  ...clause("5. No cookies or tracking",
    "The Site does not use cookies, web beacons, pixels, or third-party analytics or advertising trackers. If we introduce any of these, we will update this policy before doing so."),
  ...clause("6. Retention",
    "We keep personal information for as long as needed for the purposes above, and longer where required by securities, tax or other recordkeeping laws. Records related to advisory and fund business may be retained for the periods required by applicable law."),
  ...clause("7. Security",
    "We use administrative, technical and physical safeguards designed to protect personal information, consistent with applicable federal privacy law, including the Gramm-Leach-Bliley Act. No method of transmission over the internet is completely secure, and we cannot guarantee absolute security. Please do not send account numbers, Social Security numbers or other sensitive information through Site forms or unencrypted email."),
  ...clause("8. Your rights and choices",
    "Depending on where you live, including Connecticut, California and other U.S. states with comprehensive privacy laws, you may have rights to access, correct, delete or obtain a copy of your personal information, and to opt out of its sale, targeted advertising or profiling. Some of these laws exempt financial institutions or information covered by the Gramm-Leach-Bliley Act, and we will apply the law that governs your request. To make a request, contact us at ",
    a(EMAIL, `mailto:${EMAIL}`),
    ". We will verify your identity before responding and will not discriminate against you for exercising your rights. You may unsubscribe from marketing emails at any time using the link in the message."),
  ...clause("9. Investors in Riptide funds",
    "If you invest in a fund or account managed by Riptide, our handling of your nonpublic personal information is described in our Privacy Notice to Investors, delivered with your subscription documents and annually as required by applicable law. Contact us for a copy."),
  ...clause("10. Visitors outside the United States",
    "The Site is operated in the United States and intended for U.S. audiences. If you access it from elsewhere, including the EU, UK or Cayman Islands, your information will be transferred to and processed in the U.S. Where the GDPR, UK GDPR or Cayman Islands Data Protection Act applies, we process information on the basis of our legitimate interests, your consent, or legal obligations, and you may have additional rights, including the right to lodge a complaint with your local supervisory authority."),
  ...clause("11. Children",
    "The Site is not directed to anyone under 18, and we do not knowingly collect information from minors."),
  ...clause("12. Changes",
    "We may update this policy from time to time. The effective date above shows when it was last revised. Material changes will be posted on this page."),
  ...clause("13. Contact us",
    "Riptide Advisors LLC, Attn: Chief Compliance Officer, 12 Havemeyer Place, Greenwich, CT 06830 · ",
    a(EMAIL, `mailto:${EMAIL}`)),
];

export const DISCLAIMER_BODY = [
  p(b("Effective date: "), EFFECTIVE),
  p("By accessing riptide-advisors.com (the “Site”), you agree to the terms below. If you do not agree, please do not use the Site."),
  ...clause("1. No offer or solicitation",
    "The Site is provided for general informational purposes only. Nothing on it is an offer to sell, or a solicitation of an offer to buy, any interest in any fund, series, account or other security managed or sponsored by Riptide Advisors LLC or its affiliates (“Riptide”). Any such offer will be made only through a confidential private placement memorandum, operating or limited liability company agreement, subscription documents and related materials (the “Offering Documents”), and only in jurisdictions where permitted by law. In the event of any conflict, the Offering Documents control."),
  ...clause("2. Eligible investors only",
    "Interests in Riptide-managed vehicles, including Riptide Fund LLC and Riptide Fund SPC, are offered privately and are not registered under the Securities Act of 1933, the Investment Company Act of 1940 or any state or foreign securities law. They are available only to persons who meet applicable eligibility standards, such as “accredited investors” and, where required, “qualified clients” or “qualified purchasers.” Interests in Cayman Islands vehicles may not be offered to members of the public in the Cayman Islands."),
  ...clause("3. Not investment, legal or tax advice",
    "Content on the Site does not take into account the objectives, financial situation or needs of any person and is not investment, legal, tax or accounting advice. You should consult your own advisers before making any investment decision. Use of the Site does not create an advisory or client relationship with Riptide."),
  ...clause("4. Regulatory status",
    "Riptide Advisors LLC files reports with the U.S. Securities and Exchange Commission as an exempt reporting adviser. It is not registered as an investment adviser with the SEC or any state, and neither Riptide nor any affiliate is a registered broker-dealer or a member of FINRA or SIPC. Exempt reporting status does not imply any level of skill or training or any endorsement by a regulator."),
  ...clause("5. Risk",
    "Investments in private funds are speculative, involve a high degree of risk, are illiquid, may use leverage, short selling and derivatives, and are subject to substantial fees and expenses. Investors may lose all or a substantial portion of their investment. There is no guarantee that any investment objective or strategy will be achieved."),
  ...clause("6. Performance and third-party data",
    "Past performance is not indicative of future results. Any performance information on the Site is presented in accordance with applicable law, is subject to the disclosures accompanying it, and may be net or gross of fees as stated. Information from third-party sources is believed to be reliable but has not been independently verified, and Riptide makes no representation as to its accuracy or completeness."),
  ...clause("7. Forward-looking statements",
    "The Site may contain forward-looking statements, including statements about strategies, market conditions and expected results. These are based on current views and assumptions, involve known and unknown risks, and actual results may differ materially. Riptide undertakes no obligation to update them."),
  ...clause("8. Managers and platform services",
    "References to portfolio managers, sub-advisers or strategies on the Riptide platform are for illustration only and are not a recommendation of any manager or strategy. Platform services described on the Site are provided under separate written agreements."),
  ...clause("9. Third-party links",
    "Links to third-party websites are provided for convenience. Riptide does not control or endorse them and is not responsible for their content, privacy practices or availability."),
  ...clause("10. No warranty; limitation of liability",
    "The Site and its content are provided “as is” and “as available,” without warranties of any kind, express or implied. Information may change without notice and may not be current. To the fullest extent permitted by law, Riptide and its affiliates, officers, employees and agents are not liable for any direct, indirect, incidental, consequential or other damages arising from your use of, or reliance on, the Site. Nothing here waives any right you have under federal or state securities laws."),
  ...clause("11. Intellectual property",
    "All content, trademarks and logos on the Site are the property of Riptide or its licensors. You may view and print content for personal, non-commercial use only. You may not copy, modify, distribute or republish it without our prior written consent."),
  ...clause("12. Communications",
    "Emails or form submissions through the Site do not create a client relationship and may not be acted on promptly. Do not send trading instructions or confidential information through the Site. Communications with Riptide may be monitored and retained as required by law."),
  ...clause("13. Governing law",
    "These terms are governed by the laws of the State of Connecticut, without regard to its conflict-of-laws rules. Any dispute will be brought in the state or federal courts located in Fairfield County, Connecticut."),
  ...clause("14. Changes",
    "Riptide may modify these terms at any time by posting an updated version on the Site. Your continued use of the Site after changes are posted means you accept them. Questions may be directed to ",
    a(EMAIL, `mailto:${EMAIL}`),
    "."),
];

/** Footer disclosure (every page). The "© YEAR Riptide Advisors LLC. All rights reserved." line and the
 *  Disclaimer / Privacy Policy links are in the footer's legal row (year stays current; links not duplicated). */
export const FOOTER_DISCLOSURE = [
  p(
    "This website is for informational purposes only and is not an offer to sell or a solicitation of an offer to buy any security. Any such offer will be made only through confidential offering documents and only to eligible investors. Past performance is not indicative of future results; investing involves risk, including possible loss of principal. Riptide Advisors LLC files with the SEC as an exempt reporting adviser and is not a registered investment adviser or broker-dealer. This site does not use cookies.",
  ),
];
