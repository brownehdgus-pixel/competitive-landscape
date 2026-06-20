import { z } from "zod";
import type { NormalizedGeneratedCandidate } from "@/lib/normalizers/normalizeGeneratedCandidate";

const CANDIDATE_TYPES = [
  "Direct Competitor",
  "Indirect Competitor",
  "Comparable Listed Company",
  "Comparable Private Company",
  "Not Relevant",
  "Unclassified",
] as const;

export const generatedCandidateNormalizedSchema = z.object({
  companyName: z.string().min(1),
  suggestedCandidateType: z.enum(CANDIDATE_TYPES),
  country: z.string(),
  listedStatus: z.enum(["listed", "private", "unknown"]),
  ticker: z.string(),
  exchange: z.string(),
  website: z.string(),
  technology: z.string(),
  product: z.string(),
  indicationOrMarket: z.string(),
  customerGroup: z.string(),
  businessModel: z.string(),
  developmentStage: z.string(),
  latestFundingRound: z.string(),
  keyInvestors: z.string(),
  recentEvent: z.string(),
  reasonForSuggestion: z.string(),
  caveat: z.string(),
  evidenceSnippet: z.string().min(1),
}) satisfies z.ZodType<NormalizedGeneratedCandidate>;

export const generatedCandidateArraySchema = z.array(
  generatedCandidateNormalizedSchema
);

export type GeneratedCandidateNormalized = z.infer<
  typeof generatedCandidateNormalizedSchema
>;

export function parseRawCandidatesResponse(raw: string): unknown[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON from LLM");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !Array.isArray((parsed as { candidates?: unknown }).candidates)
  ) {
    throw new Error("Invalid JSON from LLM: missing candidates array");
  }

  return (parsed as { candidates: unknown[] }).candidates;
}
