import { classifyCandidateWithLlm } from "@/lib/openai/classify";
import {
  ClassifyParseError,
  ClassifyValidationError,
  OpenAIClientError,
  OpenAIRateLimitError,
} from "@/lib/openai/errors";
import { computeCandidateScores } from "@/lib/scoring";
import {
  CandidateNotFoundError,
  ProjectNotFoundError,
} from "@/lib/storage/errors";
import { landscapeStorage } from "@/lib/storage/landscapeStorage";
import type {
  CandidateClassification,
  CandidateCompany,
  LandscapeProject,
} from "@/types";

export const MAX_CLASSIFY_BATCH = 10;

export type ClassifyCandidateResult = {
  candidateId: string;
  companyName: string;
  success: boolean;
  error?: string;
};

export type ClassifyBatchResult = {
  results: ClassifyCandidateResult[];
  stoppedEarly: boolean;
  stopReason?: string;
};

export type ClassifyOptions = {
  candidateIds?: string[];
  unclassifiedOnly?: boolean;
};

async function getProjectOrThrow(projectId: string): Promise<LandscapeProject> {
  const project = await landscapeStorage.getById(projectId);
  if (!project) throw new ProjectNotFoundError(projectId);
  return project;
}

function resolveCandidateIds(
  project: LandscapeProject,
  options: ClassifyOptions
): string[] {
  const { candidateIds, unclassifiedOnly = false } = options;

  if (candidateIds && candidateIds.length > 0) {
    return candidateIds.slice(0, MAX_CLASSIFY_BATCH);
  }

  const pool = unclassifiedOnly
    ? project.candidates.filter((c) => c.candidateType === "Unclassified")
    : project.candidates;

  return pool.slice(0, MAX_CLASSIFY_BATCH).map((c) => c.id);
}

export function applyClassificationToCandidate(
  candidate: CandidateCompany,
  classification: CandidateClassification,
  analysisPurpose: LandscapeProject["target"]["analysisPurpose"]
): CandidateCompany {
  const now = new Date().toISOString();
  const scores = computeCandidateScores(classification, analysisPurpose);

  return {
    ...candidate,
    llmClassification: classification,
    scores,
    lastClassifiedAt: now,
    updatedAt: now,
    candidateType: candidate.manuallyOverridden
      ? candidate.candidateType
      : classification.candidateType,
  };
}

function classifyErrorMessage(error: unknown): string {
  if (error instanceof OpenAIRateLimitError) return error.message;
  if (error instanceof ClassifyParseError) return error.message;
  if (error instanceof ClassifyValidationError) return error.message;
  if (error instanceof OpenAIClientError) return error.message;
  if (error instanceof Error) return error.message;
  return "Unknown classification error";
}

export async function classifyCandidates(
  projectId: string,
  options: ClassifyOptions = {}
): Promise<ClassifyBatchResult> {
  const project = await getProjectOrThrow(projectId);
  const ids = resolveCandidateIds(project, options);

  if (ids.length === 0) {
    return {
      results: [],
      stoppedEarly: false,
    };
  }

  const results: ClassifyCandidateResult[] = [];
  let stoppedEarly = false;
  let stopReason: string | undefined;

  for (const candidateId of ids) {
    const index = project.candidates.findIndex((c) => c.id === candidateId);
    if (index === -1) {
      results.push({
        candidateId,
        companyName: candidateId,
        success: false,
        error: "Candidate not found",
      });
      continue;
    }

    const candidate = project.candidates[index];

    try {
      const classification = await classifyCandidateWithLlm(
        project.target,
        candidate
      );
      project.candidates[index] = applyClassificationToCandidate(
        candidate,
        classification,
        project.target.analysisPurpose
      );

      await landscapeStorage.update(projectId, {
        candidates: project.candidates,
      });

      results.push({
        candidateId,
        companyName: candidate.companyName,
        success: true,
      });
    } catch (error) {
      if (error instanceof OpenAIRateLimitError) {
        results.push({
          candidateId,
          companyName: candidate.companyName,
          success: false,
          error: error.message,
        });
        stoppedEarly = true;
        stopReason = error.message;
        break;
      }

      results.push({
        candidateId,
        companyName: candidate.companyName,
        success: false,
        error: classifyErrorMessage(error),
      });
    }
  }

  return { results, stoppedEarly, stopReason };
}

export async function recalculateScores(
  projectId: string,
  candidateIds?: string[]
): Promise<{ updated: number }> {
  const project = await getProjectOrThrow(projectId);
  const targetIds =
    candidateIds && candidateIds.length > 0
      ? candidateIds
      : project.candidates.map((c) => c.id);

  let updated = 0;
  const candidates = [...project.candidates];

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    if (!targetIds.includes(candidate.id)) continue;
    if (!candidate.llmClassification) continue;

    candidates[i] = {
      ...candidate,
      scores: computeCandidateScores(
        candidate.llmClassification,
        project.target.analysisPurpose
      ),
      updatedAt: new Date().toISOString(),
    };
    updated += 1;
  }

  if (updated > 0) {
    await landscapeStorage.update(projectId, { candidates });
  }

  return { updated };
}

export async function classifySingleCandidate(
  projectId: string,
  candidateId: string
): Promise<ClassifyBatchResult> {
  const project = await getProjectOrThrow(projectId);
  const exists = project.candidates.some((c) => c.id === candidateId);
  if (!exists) throw new CandidateNotFoundError(candidateId);

  return classifyCandidates(projectId, { candidateIds: [candidateId] });
}
