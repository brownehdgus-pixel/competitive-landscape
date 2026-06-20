import { normalizeCandidateType } from "@/lib/normalizers/normalizeCandidateType";
import { normalizeListedStatus } from "@/lib/normalizers/normalizeListedStatus";
import type { CandidateType, ListedStatus } from "@/types";

function asString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export type NormalizedGeneratedCandidate = {
  companyName: string;
  suggestedCandidateType: CandidateType;
  country: string;
  listedStatus: ListedStatus;
  ticker: string;
  exchange: string;
  website: string;
  technology: string;
  product: string;
  indicationOrMarket: string;
  customerGroup: string;
  businessModel: string;
  developmentStage: string;
  latestFundingRound: string;
  keyInvestors: string;
  recentEvent: string;
  reasonForSuggestion: string;
  caveat: string;
  evidenceSnippet: string;
};

export function normalizeGeneratedCandidate(
  raw: Record<string, unknown>
): NormalizedGeneratedCandidate {
  const reasonForSuggestion = asString(
    raw.reasonForSuggestion ?? raw.rationale ?? raw.memo
  );

  return {
    companyName: asString(raw.companyName),
    suggestedCandidateType: normalizeCandidateType(
      raw.suggestedCandidateType ?? raw.candidateType ?? raw.type
    ),
    country: asString(raw.country),
    listedStatus: normalizeListedStatus(raw.listedStatus),
    ticker: asString(raw.ticker),
    exchange: asString(raw.exchange),
    website: asString(raw.website ?? raw.sourceUrl),
    technology: asString(raw.technology),
    product: asString(raw.product),
    indicationOrMarket: asString(raw.indicationOrMarket),
    customerGroup: asString(raw.customerGroup),
    businessModel: asString(raw.businessModel),
    developmentStage: asString(raw.developmentStage),
    latestFundingRound: asString(raw.latestFundingRound),
    keyInvestors: asString(raw.keyInvestors),
    recentEvent: asString(raw.recentEvent),
    reasonForSuggestion,
    caveat: asString(raw.caveat),
    evidenceSnippet:
      asString(raw.evidenceSnippet) ||
      reasonForSuggestion ||
      "AI-suggested candidate; source verification required.",
  };
}
