import { z } from "zod";
import type { ConfidenceLevel } from "@/types";

export const analyzeTargetOutputSchema = z.object({
  description: z.string().optional(),
  coreTechnology: z.string().optional(),
  productOrService: z.string().optional(),
  indicationOrMarket: z.string().optional(),
  customerGroup: z.string().optional(),
  businessModel: z.string().optional(),
  developmentStage: z.string().optional(),
  confidence: z.enum(["High", "Medium", "Low"]),
  caveats: z.array(z.string()).optional(),
});

export type AnalyzeTargetLlmOutput = z.infer<typeof analyzeTargetOutputSchema>;

export function parseAnalyzeTargetOutput(raw: string): AnalyzeTargetLlmOutput {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON from LLM");
  }

  const result = analyzeTargetOutputSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Validation failed: ${issues}`);
  }

  return result.data;
}

export function confidenceToLevel(
  confidence: AnalyzeTargetLlmOutput["confidence"]
): ConfidenceLevel {
  return confidence;
}
