import { chatCompletionText } from "@/lib/openai/client";
import type { CandidateCompany, TargetCompany } from "@/types";

const IMPLICATION_SYSTEM = `You are an expert biotech/pharma analyst writing implications for a competitive landscape report.

Rules:
- Use ONLY information explicitly provided about the target and approved candidates.
- Do NOT invent company names, funding amounts, clinical data, or facts not in the evidence.
- If evidence is insufficient, state limitations clearly instead of speculating.
- Write 2–4 concise paragraphs in professional analyst tone.
- Output plain Markdown text only (no JSON, no section headings).`;

function formatApprovedCandidatesForLlm(
  candidates: CandidateCompany[]
): string {
  const approved = candidates.filter((c) => c.reviewStatus === "Approved");

  if (approved.length === 0) {
    return "No approved candidates.";
  }

  return approved
    .map((candidate) => {
      const evidence =
        candidate.evidenceSources.length === 0
          ? "No evidence on file."
          : candidate.evidenceSources
              .map((s, i) => {
                const parts = [
                  `[${i + 1}]`,
                  s.sourceTitle,
                  s.sourceType,
                  s.sourceUrl,
                  s.evidenceSnippet,
                ].filter(Boolean);
                return parts.join(" | ");
              })
              .join("\n");

      return `### ${candidate.companyName}
Type: ${candidate.candidateType}
Technology: ${candidate.technology ?? "N/A"}
Product: ${candidate.product ?? "N/A"}
Market: ${candidate.indicationOrMarket ?? "N/A"}
Stage: ${candidate.developmentStage ?? "N/A"}
Scores: ${candidate.scores ? `Direct ${candidate.scores.directCompetitorScore}, Listed ${candidate.scores.listedComparableScore}, VC Exit ${candidate.scores.vcExitComparableScore}, Overall ${candidate.scores.overallRelevanceScore}` : "N/A"}
Rationale: ${candidate.llmClassification?.rationale ?? "N/A"}
Analyst Note: ${candidate.userNote ?? "N/A"}
Evidence:
${evidence}`;
    })
    .join("\n\n");
}

function formatTargetForLlm(target: TargetCompany): string {
  return `Company: ${target.companyName}
Description: ${target.description ?? "N/A"}
Core Technology: ${target.coreTechnology ?? "N/A"}
Product/Service: ${target.productOrService ?? "N/A"}
Indication/Market: ${target.indicationOrMarket ?? "N/A"}
Customer Group: ${target.customerGroup ?? "N/A"}
Business Model: ${target.businessModel ?? "N/A"}
Development Stage: ${target.developmentStage ?? "N/A"}
Analysis Purpose: ${target.analysisPurpose}`;
}

export async function generateTechSpecialImplication(
  target: TargetCompany,
  candidates: CandidateCompany[]
): Promise<string> {
  const user = `Write implications for a **Tech-Special Listing** evaluation.

Focus on: competitive positioning, listed comparables usefulness, valuation benchmarking signals, and listing readiness considerations based only on approved candidates and their evidence.

## Target
${formatTargetForLlm(target)}

## Approved Candidates
${formatApprovedCandidatesForLlm(candidates)}`;

  return chatCompletionText(IMPLICATION_SYSTEM, user);
}

export async function generateVcImplication(
  target: TargetCompany,
  candidates: CandidateCompany[]
): Promise<string> {
  const user = `Write implications for a **VC Investment Review**.

Focus on: competitive threats, M&A/funding comparables, strategic investor fit, and investment thesis considerations based only on approved candidates and their evidence.

## Target
${formatTargetForLlm(target)}

## Approved Candidates
${formatApprovedCandidatesForLlm(candidates)}`;

  return chatCompletionText(IMPLICATION_SYSTEM, user);
}

export function buildFallbackImplication(
  kind: "tech-special" | "vc",
  candidates: CandidateCompany[]
): string {
  const approved = candidates.filter((c) => c.reviewStatus === "Approved");

  if (approved.length === 0) {
    return "_No approved candidates available for implication analysis. Approve relevant candidates after review._";
  }

  const names = approved.map((c) => c.companyName).join(", ");
  const focus =
    kind === "tech-special"
      ? "Tech-Special Listing positioning and listed comparables"
      : "VC investment thesis and exit comparables";

  return `_LLM implication not generated (OPENAI_API_KEY unavailable). ${approved.length} approved candidate(s) on file: ${names}. Manual analyst review recommended for ${focus}._`;
}
