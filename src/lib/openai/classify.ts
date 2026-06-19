import { chatCompletionJson } from "@/lib/openai/client";
import {
  ClassifyParseError,
  ClassifyValidationError,
} from "@/lib/openai/errors";
import { parseLlmClassifyOutput } from "@/lib/openai/classifySchema";
import type {
  CandidateClassification,
  CandidateCompany,
  TargetCompany,
} from "@/types";

const SYSTEM_PROMPT = `You are an expert biotech/pharma competitive landscape analyst.
Classify a candidate company relative to a target company and score similarity on 8 dimensions (0–100 integers).

Candidate types (use exactly one):
- Direct Competitor: same core technology/modality and overlapping market with direct competitive threat
- Indirect Competitor: related technology or adjacent market with partial overlap
- Comparable Listed Company: public company useful as a listed comparable (valuation, stage, business model)
- Comparable Private Company: private company useful as a VC/M&A comparable
- Not Relevant: insufficient overlap for competitive or comparable analysis

Scoring guidance (0 = no similarity, 100 = very strong similarity):
1. technologySimilarityScore — core technology, modality, platform
2. marketSimilarityScore — indication, therapeutic area, customer segment
3. businessModelSimilarityScore — revenue model, go-to-market, partnership structure
4. stageSimilarityScore — development/commercialization stage alignment
5. fundingMnaRelevanceScore — relevance of recent funding, M&A, or strategic deals
6. strategicBuyerInvestorFitScore — fit with likely strategic acquirers or investors
7. valuationUsabilityScore — usefulness for valuation benchmarking (especially listed comps)
8. geographyRegulatorySimilarityScore — geography and regulatory context similarity

Return JSON only with these exact keys:
candidateType, confidence (0–1), rationale, caveat (optional),
technologySimilarityScore, marketSimilarityScore, businessModelSimilarityScore,
stageSimilarityScore, fundingMnaRelevanceScore, strategicBuyerInvestorFitScore,
valuationUsabilityScore, geographyRegulatorySimilarityScore.

Do NOT output Unclassified. Do NOT compute final composite scores.`;

function formatEvidence(candidate: CandidateCompany): string {
  if (candidate.evidenceSources.length === 0) {
    return "No evidence sources on file.";
  }

  return candidate.evidenceSources
    .map((source, index) => {
      const parts = [
        `[${index + 1}]`,
        source.sourceTitle,
        source.sourceType,
        source.sourceUrl,
        source.evidenceSnippet,
      ].filter(Boolean);
      return parts.join(" | ");
    })
    .join("\n");
}

function buildUserPrompt(
  target: TargetCompany,
  candidate: CandidateCompany
): string {
  return `## Target Company
Company: ${target.companyName}
Description: ${target.description ?? "N/A"}
Core Technology: ${target.coreTechnology ?? "N/A"}
Product/Service: ${target.productOrService ?? "N/A"}
Indication/Market: ${target.indicationOrMarket ?? "N/A"}
Customer Group: ${target.customerGroup ?? "N/A"}
Business Model: ${target.businessModel ?? "N/A"}
Development Stage: ${target.developmentStage ?? "N/A"}
Analysis Purpose: ${target.analysisPurpose}

## Candidate Company
Company: ${candidate.companyName}
Country: ${candidate.country ?? "N/A"}
Listed Status: ${candidate.listedStatus}
Ticker: ${candidate.ticker ?? "N/A"}
Exchange: ${candidate.exchange ?? "N/A"}
Website: ${candidate.website ?? "N/A"}
Technology: ${candidate.technology ?? "N/A"}
Product: ${candidate.product ?? "N/A"}
Indication/Market: ${candidate.indicationOrMarket ?? "N/A"}
Customer Group: ${candidate.customerGroup ?? "N/A"}
Business Model: ${candidate.businessModel ?? "N/A"}
Development Stage: ${candidate.developmentStage ?? "N/A"}
Latest Funding Round: ${candidate.latestFundingRound ?? "N/A"}
Key Investors: ${candidate.keyInvestors ?? "N/A"}
Recent Event: ${candidate.recentEvent ?? "N/A"}
Analyst Memo: ${candidate.memo ?? "N/A"}

## Evidence Sources
${formatEvidence(candidate)}

Classify this candidate and provide 8 sub-scores.`;
}

export async function classifyCandidateWithLlm(
  target: TargetCompany,
  candidate: CandidateCompany
): Promise<CandidateClassification> {
  const raw = await chatCompletionJson(
    SYSTEM_PROMPT,
    buildUserPrompt(target, candidate)
  );

  try {
    return parseLlmClassifyOutput(raw);
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
