import { chatCompletionJson } from "@/lib/openai/client";
import {
  ClassifyParseError,
  ClassifyValidationError,
} from "@/lib/openai/errors";
import { parseRawCandidatesResponse } from "@/lib/openai/generateCandidatesSchema";
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
- Include a short rationale in reasonForSuggestion, memo, or rationale field.
- Include website or sourceUrl when you know an official website.
- Do not duplicate companies in your list.
- These are AI suggestions for human review — note uncertainty in caveat where appropriate.

For listedStatus, return exactly one of:
- "listed"
- "private"
- "unknown"

Do not return "public", "unlisted", "startup", "NASDAQ-listed", "N/A", or any other value.

For suggestedCandidateType, return exactly one of:
- "Direct Competitor"
- "Indirect Competitor"
- "Comparable Listed Company"
- "Comparable Private Company"

If uncertain, choose the closest category and explain uncertainty in caveat.

Return JSON only: { "candidates": [ ... ] }
Each candidate object may include:
companyName (required), suggestedCandidateType, country, listedStatus, website, technology, product, indicationOrMarket, customerGroup, businessModel, developmentStage, latestFundingRound, keyInvestors, recentEvent, reasonForSuggestion, memo, sourceUrl, rationale, caveat, evidenceSnippet.`;

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
): Promise<unknown[]> {
  const raw = await chatCompletionJson(
    SYSTEM_PROMPT,
    buildUserPrompt(target, existingNames)
  );

  try {
    return parseRawCandidatesResponse(raw);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.startsWith("Invalid JSON")) {
        throw new ClassifyParseError(error.message);
      }
      throw new ClassifyValidationError(error.message);
    }
    throw error;
  }
}
