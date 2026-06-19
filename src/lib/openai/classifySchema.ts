import { z } from "zod";
import type { CandidateClassification } from "@/types";

const LLM_CANDIDATE_TYPES = [
  "Direct Competitor",
  "Indirect Competitor",
  "Comparable Listed Company",
  "Comparable Private Company",
  "Not Relevant",
] as const;

const integerScore = z
  .number()
  .int("Sub-scores must be integers")
  .min(0, "Sub-score must be at least 0")
  .max(100, "Sub-score must be at most 100");

export const llmClassifyOutputSchema = z.object({
  candidateType: z.enum(LLM_CANDIDATE_TYPES),
  confidence: z.number().min(0).max(1),
  rationale: z.string().min(1),
  caveat: z.string().optional(),
  technologySimilarityScore: integerScore,
  marketSimilarityScore: integerScore,
  businessModelSimilarityScore: integerScore,
  stageSimilarityScore: integerScore,
  fundingMnaRelevanceScore: integerScore,
  strategicBuyerInvestorFitScore: integerScore,
  valuationUsabilityScore: integerScore,
  geographyRegulatorySimilarityScore: integerScore,
});

export type LlmClassifyOutput = z.infer<typeof llmClassifyOutputSchema>;

export function parseLlmClassifyOutput(raw: string): CandidateClassification {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON from LLM");
  }

  const result = llmClassifyOutputSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Validation failed: ${issues}`);
  }

  return result.data;
}
