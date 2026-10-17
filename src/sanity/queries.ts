import { defineQuery } from "next-sanity";

const LINK = `{label, href}`;
const IMAGE = `{..., "alt": alt, asset->{_id, url, metadata{lqip, dimensions}}}`;

export const SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    siteName, defaultDescription, ogImage${IMAGE}, email, addressLines, locationShort, linkedin,
    headerCta${LINK}, mainNav[]${LINK}, footerTagline, footerNav[]${LINK}, legalLinks[]${LINK},
    footerDisclosure,
    siteDisclaimer->{_id, title, "scope": scope.current, version, kicker, heading, instruction, body,
      acceptLabel, declineLabel, declineHref, requireScroll, persistence, logAcceptance}
  }
`);

export const PAGE_PATHS_QUERY = defineQuery(`
  *[_type == "page" && defined(path)]{ "path": path }
`);

export const PAGE_QUERY = defineQuery(`
  *[_type == "page" && path == $path][0]{
    _id, title, path,
    seo{title, description, noindex, ogImage${IMAGE}},
    gate->{_id, title, "scope": scope.current, version, kicker, heading, instruction, body,
      acceptLabel, declineLabel, declineHref, requireScroll, persistence, logAcceptance},
    sections[]{
      ...,
      _type == "teamGrid" => { ..., members[]->{_id, name, role, linkedin, bio, photo${IMAGE}} },
      image${IMAGE},
      cards[]{..., icon${IMAGE}},
      chapters[]{..., image${IMAGE}}
    }
  }
`);
