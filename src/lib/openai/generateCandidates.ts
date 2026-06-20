import { chatCompletionJson } from "@/lib/openai/client";
import {
  ClassifyParseError,
  ClassifyValidationError,
} from "@/lib/openai/errors";
import {
  parseGenerateCandidatesOutput,
  type GenerateCandidatesLlmOutput,
} from "@/lib/openai/generateCandidatesSchema";
import type { TargetCompany } from "@/types";

const SYSTEM_PROMPT = `You are an expert biotech/pharma competitive landscape analyst.

Given a target company profile, suggest 12 to 20 candidate companies for competitive/comparable analysis.

Include a mix relevant to the analysis purpose:
- Direct and indirect competitors
- Comparable listed companies
- Comparable private companies

Rules:
- Use real company names when possible.
- Provide technology, product, market, business model, and stage fields when known.
- Include a short rationale in memo or rationale field.
- Include sourceUrl when you know an official website.
- Do not duplicate companies in your list.
- These are AI suggestions for human review — note uncertainty where appropriate.

Return JSON only: { "candidates": [ ... ] }
Each candidate object may include:
companyName (required), country, listedStatus (listed|private|unknown), website, technology, product, indicationOrMarket, customerGroup, businessModel, developmentStage, memo, sourceUrl, rationale.`;

function buildUserPrompt(
  target: TargetCompany,
  existingNames: string[]
): string {
  const existingList =
    existingNames.length > 0
      ? existingNames.join(", ")
      : "(none yet)";

  return `## Target Company Profile
Company: ${target.companyName}
Website: ${target.website ?? "N/A"}
Description: ${target.description ?? "N/A"}
Core Technology: ${target.coreTechnology ?? "N/A"}
Product/Service: ${target.productOrService ?? "N/A"}
Indication/Market: ${target.indicationOrMarket ?? "N/A"}
Customer Group: ${target.customerGroup ?? "N/A"}
Business Model: ${target.businessModel ?? "N/A"}
Development Stage: ${target.developmentStage ?? "N/A"}
Analysis Purpose: ${target.analysisPurpose}

## Existing Candidates (do not duplicate by company name)
${existingList}

Suggest 12 to 20 new candidate companies.`;
}

export async function generateCandidatesWithLlm(
  target: TargetCompany,
  existingNames: string[]
): Promise<GenerateCandidatesLlmOutput> {
  const raw = await chatCompletionJson(
    SYSTEM_PROMPT,
    buildUserPrompt(target, existingNames)
  );

  try {
    return parseGenerateCandidatesOutput(raw);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.startsWith("Invalid JSON")) {
        throw new ClassifyParseError(error.message);
      }
      if (error.message.startsWith("Validation failed")) {
        throw new ClassifyValidationError(error.message);
      }
    }
    throw error;
  }
}
