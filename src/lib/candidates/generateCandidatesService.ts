import { generateCandidatesWithLlm } from "@/lib/openai/generateCandidates";
import { generatedCandidateNormalizedSchema } from "@/lib/openai/generateCandidatesSchema";
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
import { normalizeCompanyNameKey } from "@/lib/normalizers/normalizeCompanyNameKey";
import {
  normalizeGeneratedCandidate,
  type NormalizedGeneratedCandidate,
} from "@/lib/normalizers/normalizeGeneratedCandidate";
import { ProjectNotFoundError } from "@/lib/storage/errors";
import { landscapeStorage } from "@/lib/storage/landscapeStorage";
import type { CandidateCompany } from "@/types";

export type SkippedDuplicateEntry = {
  companyName: string;
};

export type SkippedMalformedEntry = {
  companyName?: string;
  reason: string;
};

export type GenerateCandidatesResult = {
  addedCount: number;
  skippedDuplicateCount: number;
  skippedMalformedCount: number;
  candidates: CandidateCompany[];
  skippedDuplicates: SkippedDuplicateEntry[];
  skippedMalformed: SkippedMalformedEntry[];
};

function optionalString(value: string): string | undefined {
  return value.trim() ? value.trim() : undefined;
}

function mapNormalizedToCandidateCompany(
  normalized: NormalizedGeneratedCandidate
): CandidateCompany {
  return createCandidateCompany({
    companyName: normalized.companyName,
    country: optionalString(normalized.country),
    listedStatus: normalized.listedStatus,
    ticker: optionalString(normalized.ticker),
    exchange: optionalString(normalized.exchange),
    website: optionalString(normalized.website),
    technology: optionalString(normalized.technology),
    product: optionalString(normalized.product),
    indicationOrMarket: optionalString(normalized.indicationOrMarket),
    customerGroup: optionalString(normalized.customerGroup),
    businessModel: optionalString(normalized.businessModel),
    developmentStage: optionalString(normalized.developmentStage),
    latestFundingRound: optionalString(normalized.latestFundingRound),
    keyInvestors: optionalString(normalized.keyInvestors),
    recentEvent: optionalString(normalized.recentEvent),
    memo: optionalString(normalized.reasonForSuggestion),
    candidateType: normalized.suggestedCandidateType,
    reviewStatus: "Pending",
    userNote: "AI-generated candidate; verify source before using in report.",
    manuallyOverridden: false,
    evidenceSources: [
      createEvidenceSource({
        sourceType: "manual",
        sourceUrl: optionalString(normalized.website),
        evidenceSnippet: normalized.evidenceSnippet,
        confidenceLevel: "Low",
      }),
    ],
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
  const existingNameKeys = new Set(
    project.candidates.map((c) => normalizeCompanyNameKey(c.companyName))
  );

  let rawCandidates: unknown[];
  try {
    rawCandidates = await generateCandidatesWithLlm(
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

  const batchNameKeys = new Set<string>();
  const toAdd: CandidateCompany[] = [];
  const skippedDuplicates: SkippedDuplicateEntry[] = [];
  const skippedMalformed: SkippedMalformedEntry[] = [];

  for (const raw of rawCandidates) {
    if (!raw || typeof raw !== "object") {
      skippedMalformed.push({ reason: "Candidate is not an object" });
      continue;
    }

    const normalized = normalizeGeneratedCandidate(
      raw as Record<string, unknown>
    );

    if (!normalized.companyName) {
      skippedMalformed.push({ reason: "Missing companyName" });
      continue;
    }

    const validation = generatedCandidateNormalizedSchema.safeParse(normalized);
    if (!validation.success) {
      skippedMalformed.push({
        companyName: normalized.companyName,
        reason: validation.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; "),
      });
      continue;
    }

    const nameKey = normalizeCompanyNameKey(validation.data.companyName);

    if (existingNameKeys.has(nameKey) || batchNameKeys.has(nameKey)) {
      skippedDuplicates.push({ companyName: validation.data.companyName });
      continue;
    }

    const candidate = mapNormalizedToCandidateCompany(validation.data);
    batchNameKeys.add(nameKey);
    toAdd.push(candidate);
  }

  if (toAdd.length > 0) {
    await landscapeStorage.update(projectId, {
      candidates: [...project.candidates, ...toAdd],
    });
  }

  return {
    addedCount: toAdd.length,
    skippedDuplicateCount: skippedDuplicates.length,
    skippedMalformedCount: skippedMalformed.length,
    candidates: toAdd,
    skippedDuplicates,
    skippedMalformed,
  };
}
