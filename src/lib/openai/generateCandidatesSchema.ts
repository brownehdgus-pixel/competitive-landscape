import { z } from "zod";

const suggestedCandidateSchema = z.object({
  companyName: z.string().min(1),
  country: z.string().optional(),
  listedStatus: z.enum(["listed", "private", "unknown"]).optional(),
  website: z.string().optional(),
  technology: z.string().optional(),
  product: z.string().optional(),
  indicationOrMarket: z.string().optional(),
  customerGroup: z.string().optional(),
  businessModel: z.string().optional(),
  developmentStage: z.string().optional(),
  memo: z.string().optional(),
  sourceUrl: z.string().optional(),
  rationale: z.string().optional(),
});

export const generateCandidatesOutputSchema = z.object({
  candidates: z.array(suggestedCandidateSchema).min(1).max(25),
});

export type GenerateCandidatesLlmOutput = z.infer<
  typeof generateCandidatesOutputSchema
>;

export type SuggestedCandidate = GenerateCandidatesLlmOutput["candidates"][number];

export function parseGenerateCandidatesOutput(
  raw: string
): GenerateCandidatesLlmOutput {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON from LLM");
  }

  const result = generateCandidatesOutputSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Validation failed: ${issues}`);
  }

  return result.data;
}
