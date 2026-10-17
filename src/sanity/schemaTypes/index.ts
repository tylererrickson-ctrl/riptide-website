import { link } from "./objects/link";
import { seo } from "./objects/seo";
import { rail } from "./objects/rail";
import { richText } from "./objects/richText";
import { review } from "./objects/review";
import { sectionTypes } from "./objects/sections";
import { page } from "./documents/page";
import { teamMember } from "./documents/teamMember";
import { disclaimer } from "./documents/disclaimer";
import { siteSettings } from "./documents/siteSettings";
import { publishRecord } from "./documents/publishRecord";
import { gateAcceptance } from "./documents/gateAcceptance";

export const schemaTypes = [
  link, seo, rail, richText, review, ...sectionTypes,
  page, teamMember, disclaimer, siteSettings, publishRecord, gateAcceptance,
];

/** Document types that go through the review → approve → publish workflow. */
export const reviewedTypes = ["page", "teamMember", "disclaimer", "siteSettings"];
