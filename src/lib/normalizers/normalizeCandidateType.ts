import type { CandidateType } from "@/types";

export function normalizeCandidateType(value: unknown): CandidateType {
  if (value === null || value === undefined) return "Unclassified";

  const v = String(value).trim().toLowerCase();

  if (!v) return "Unclassified";

  if (
    v.includes("indirect") ||
    v.includes("alternative") ||
    v.includes("substitute") ||
    v.includes("replacement") ||
    v.includes("existing solution") ||
    v.includes("standard of care") ||
    v === "indirect competitor"
  ) {
    return "Indirect Competitor";
  }

  if (
    v === "direct" ||
    v.startsWith("direct ") ||
    v.includes("direct competitor") ||
    v.includes("same technology") ||
    v.includes("same indication")
  ) {
    return "Direct Competitor";
  }

  if (
    v.includes("comparable listed") ||
    v.includes("listed comparable") ||
    v.includes("public comparable") ||
    v.includes("public company") ||
    v.includes("listed company") ||
    v.includes("publicly traded")
  ) {
    return "Comparable Listed Company";
  }

  if (
    v.includes("comparable private") ||
    v.includes("private comparable") ||
    v.includes("private company") ||
    v.includes("venture-backed") ||
    v.includes("startup comparable") ||
    v.includes("vc comparable")
  ) {
    return "Comparable Private Company";
  }

  if (
    v.includes("not relevant") ||
    v.includes("irrelevant") ||
    v.includes("not applicable") ||
    v === "n/a"
  ) {
    return "Not Relevant";
  }

  return "Unclassified";
}
