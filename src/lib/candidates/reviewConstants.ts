/** Step 7 수동 재분류 4유형 (Not Relevant / Unclassified 제외) */
export const MANUAL_RECLASSIFY_TYPES = [
  "Direct Competitor",
  "Indirect Competitor",
  "Comparable Listed Company",
  "Comparable Private Company",
] as const;

export type ManualReclassifyType = (typeof MANUAL_RECLASSIFY_TYPES)[number];
