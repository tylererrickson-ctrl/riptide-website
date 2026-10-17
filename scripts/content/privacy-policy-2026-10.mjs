// Privacy Policy (2026-10-17). Written to match what riptide-advisors.com actually does — forms →
// Notion, mailing list → Notion, disclaimer-acceptance log (hashed IP) → Sanity, hosting on Vercel,
// browser storage only for preferences/disclaimer, no analytics or advertising trackers.
// If the site's data handling changes (e.g. analytics or an email platform is added), update this.
// Shared by import-content.mjs and the one-off API publish.

let n = 0;
const k = () => `pp${(n++).toString(36).padStart(3, "0")}`;
const span = (text, marks = []) => ({ _type: "span", _key: k(), text, marks });
const p = (...parts) => ({ _type: "block", _key: k(), style: "normal", markDefs: [], children: parts.map((x) => (typeof x === "string" ? span(x) : x)) });
const h2 = (text) => ({ _type: "block", _key: k(), style: "h2", markDefs: [], children: [span(text)] });
const h3 = (text) => ({ _type: "block", _key: k(), style: "h3", markDefs: [], children: [span(text)] });
const li = (...parts) => ({ ...p(...parts), listItem: "bullet", level: 1 });
const b = (text) => span(text, ["strong"]);

export const PRIVACY_LAST_UPDATED = "2026-10-17";

export const PRIVACY_BODY = [
  p(
    "Riptide Advisors LLC (“Riptide,” “we,” “us”) respects your privacy. This policy explains what information we collect through www.riptide-advisors.com (the “Site”), how we use and share it, and the choices you have. It applies only to the Site. Investors in funds or accounts we manage may receive separate privacy notices that govern that relationship.",
  ),

  h2("Information we collect"),
  h3("Information you give us"),
  li(b("Contact forms. "), "If you contact us as a portfolio manager, we collect your name, email address and the details you choose to share, such as your strategy, current role, assets under management or risk capital, prime broker, an investment idea and a description of your strategy. If you contact us as an investor, we collect your name, email address, allocator type, title, mandate, intended investment size and your message."),
  li(b("Mailing list. "), "If you join our mailing list, we collect your name, email address, whether you are an investor, portfolio manager or other, the date you subscribed and the consent wording shown to you."),
  li(b("Email and other correspondence. "), "If you email or call us, we keep the information you send."),
  h3("Information collected automatically"),
  li(b("Disclaimer acknowledgements. "), "Some pages, such as fund performance information, are available only after you confirm you meet certain eligibility requirements. When you accept, we record the notice and version you accepted, the page, the time, your browser type and a one-way hashed version of your IP address. We keep this record for compliance purposes and do not use it to identify you for marketing."),
  li(b("Server logs. "), "Our hosting provider automatically processes technical information needed to deliver and secure the Site, such as IP address, browser type, the pages requested and the time of the request."),
  li(b("Browser storage. "), "The Site stores a small number of preferences in your browser (local or session storage): your light or dark display setting, whether you have seen the opening animation, and whether you have accepted a disclaimer. These stay on your device and are not used to track you."),
  p(
    b("No advertising or analytics tracking. "),
    "The Site does not use advertising cookies, third-party analytics, social-media pixels or similar tracking technologies. We do not respond to “Do Not Track” signals because we do not track you across sites. If this changes, we will update this policy first.",
  ),

  h2("How we use information"),
  li("To respond to your enquiry and evaluate a potential relationship with you."),
  li("To send our mailing-list emails, if you have subscribed."),
  li("To operate, maintain and secure the Site, and to prevent spam and abuse of our forms."),
  li("To keep records required for regulatory, compliance and legal purposes, and to enforce our rights."),
  p("We do not sell or rent your personal information, and we do not share it with third parties for their own marketing."),

  h2("How we share information"),
  p("We share information only as needed to run our business and the Site:"),
  li(b("Service providers "), "who process information on our behalf under contractual obligations, including our website host (Vercel), our content-management provider (Sanity), the workspace where we keep enquiries and our mailing list (Notion), and our email providers."),
  li(b("Affiliates and professional advisers, "), "such as our lawyers, auditors and compliance consultants, where needed."),
  li(b("Regulators and legal process, "), "when required by law, regulation, subpoena or court order, or to protect the rights, property or safety of Riptide, our clients or others."),
  li(b("Business transfers, "), "in connection with a merger, acquisition or sale of all or part of our business."),

  h2("Your choices"),
  li(b("Unsubscribe. "), "Every mailing-list email includes a way to unsubscribe, or you can email us at any time and we will remove you."),
  li(b("Access, correction and deletion. "), "You may ask to see, correct or delete the personal information we hold about you by emailing info@riptide-advisors.com. We will respond within a reasonable time, subject to records we must keep by law."),
  li(b("Browser storage. "), "You can clear the Site’s stored preferences at any time through your browser settings."),
  p("Depending on where you live, you may have additional rights under local law. We will honour requests as required by applicable law."),

  h2("Retention and security"),
  p(
    "We keep personal information for as long as needed for the purposes described above, including any period required by law or regulation. We use reasonable administrative, technical and physical safeguards, including encrypted connections (HTTPS) and access controls, to protect the information we hold. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.",
  ),

  h2("Children"),
  p("The Site is intended for professional and adult audiences and is not directed to children under 18. We do not knowingly collect personal information from children."),

  h2("International visitors"),
  p("Riptide is based in the United States, and the Site and our service providers process information in the United States. If you access the Site from elsewhere, your information will be transferred to and processed in the United States."),

  h2("Links to other sites"),
  p("The Site may link to other websites, such as LinkedIn. We are not responsible for the privacy practices of those sites, and we encourage you to read their policies."),

  h2("Changes to this policy"),
  p("We may update this policy from time to time. The “Last updated” date above shows when it last changed. Material changes will be posted on this page."),

  h2("Contact us"),
  p("Questions or requests about this policy can be sent to:"),
  p("Riptide Advisors LLC, 12 Havemeyer Place, Greenwich, CT 06830"),
  p("info@riptide-advisors.com"),
];
