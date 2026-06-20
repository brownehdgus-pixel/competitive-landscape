import { generateCandidatesWithLlm } from "@/lib/openai/generateCandidates";
import type { SuggestedCandidate } from "@/lib/openai/generateCandidatesSchema";
import {
  ClassifyParseError,
  ClassifyValidationError,
  OpenAIClientError,
  OpenAIRateLimitError,
} from "@/lib/openai/errors";
import {
  createCandidateCompany,
  createEvidenceSource,
} from "@/lib/factories";
import { ProjectNotFoundError } from "@/lib/storage/errors";
import { landscapeStorage } from "@/lib/storage/landscapeStorage";
import type { CandidateCompany } from "@/types";

export type GenerateCandidatesResult = {
  addedCount: number;
  skippedDuplicateCount: number;
  added: CandidateCompany[];
};

function normalizeCompanyName(name: string): string {
  return name.trim().toLowerCase();
}

function buildExistingNameSet(candidates: CandidateCompany[]): Set<string> {
  return new Set(candidates.map((c) => normalizeCompanyName(c.companyName)));
}

function isDuplicate(
  name: string,
  existingNames: Set<string>,
  batchNames: Set<string>
): boolean {
  const normalized = normalizeCompanyName(name);
  return existingNames.has(normalized) || batchNames.has(normalized);
}

function suggestedToCandidate(suggested: SuggestedCandidate): CandidateCompany {
  const evidenceSnippet =
    suggested.rationale ?? suggested.memo ?? "AI-suggested candidate for human review.";

  const evidence = createEvidenceSource({
    sourceTitle: "AI suggestion",
    sourceUrl: suggested.sourceUrl ?? suggested.website,
    sourceType: "manual",
    evidenceSnippet,
    confidenceLevel: "Low",
  });

  return createCandidateCompany({
    companyName: suggested.companyName.trim(),
    country: suggested.country,
    listedStatus: suggested.listedStatus ?? "unknown",
    website: suggested.website,
    technology: suggested.technology,
    product: suggested.product,
    indicationOrMarket: suggested.indicationOrMarket,
    customerGroup: suggested.customerGroup,
    businessModel: suggested.businessModel,
    developmentStage: suggested.developmentStage,
    memo: suggested.memo ?? suggested.rationale,
    evidenceSources: [evidence],
    candidateType: "Unclassified",
    reviewStatus: "Pending",
  });
}

async function getProjectOrThrow(projectId: string) {
  const project = await landscapeStorage.getById(projectId);
  if (!project) throw new ProjectNotFoundError(projectId);
  return project;
}

export async function generateCandidatesForProject(
  projectId: string
): Promise<GenerateCandidatesResult> {
  const project = await getProjectOrThrow(projectId);
  const existingNames = buildExistingNameSet(project.candidates);

  let llmOutput;
  try {
    llmOutput = await generateCandidatesWithLlm(
      project.target,
      project.candidates.map((c) => c.companyName)
    );
  } catch (error) {
    if (error instanceof OpenAIRateLimitError) {
      throw error;
    }
    if (error instanceof OpenAIClientError) {
      throw error;
    }
    if (
      error instanceof ClassifyParseError ||
      error instanceof ClassifyValidationError
    ) {
      throw new OpenAIClientError(error.message);
    }
    throw error;
  }

  const batchNames = new Set<string>();
  const toAdd: CandidateCompany[] = [];
  let skippedDuplicateCount = 0;

  for (const suggested of llmOutput.candidates) {
    if (isDuplicate(suggested.companyName, existingNames, batchNames)) {
      skippedDuplicateCount += 1;
      continue;
    }

    const candidate = suggestedToCandidate(suggested);
    batchNames.add(normalizeCompanyName(candidate.companyName));
    toAdd.push(candidate);
  }

  if (toAdd.length > 0) {
    await landscapeStorage.update(projectId, {
      candidates: [...project.candidates, ...toAdd],
    });
  }

  return {
    addedCount: toAdd.length,
    skippedDuplicateCount,
    added: toAdd,
  };
}
