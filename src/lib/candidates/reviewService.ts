import {
  CandidateNotFoundError,
  ProjectNotFoundError,
} from "@/lib/storage/errors";
import { landscapeStorage } from "@/lib/storage/landscapeStorage";
import type { ManualReclassifyType } from "@/lib/candidates/reviewConstants";
import type {
  CandidateCompany,
  CandidateType,
  LandscapeProject,
  ReviewStatus,
} from "@/types";

export type { ManualReclassifyType } from "@/lib/candidates/reviewConstants";

async function getProjectWithCandidate(
  projectId: string,
  candidateId: string
): Promise<{
  project: LandscapeProject;
  index: number;
  candidate: CandidateCompany;
}> {
  const project = await landscapeStorage.getById(projectId);
  if (!project) throw new ProjectNotFoundError(projectId);

  const index = project.candidates.findIndex((c) => c.id === candidateId);
  if (index === -1) throw new CandidateNotFoundError(candidateId);

  return { project, index, candidate: project.candidates[index] };
}

async function saveCandidate(
  project: LandscapeProject,
  index: number,
  updated: CandidateCompany
): Promise<CandidateCompany> {
  const next = [...project.candidates];
  next[index] = updated;
  await landscapeStorage.update(project.id, { candidates: next });
  return updated;
}

export async function updateReviewStatus(
  projectId: string,
  candidateId: string,
  reviewStatus: ReviewStatus
): Promise<CandidateCompany> {
  const { project, index, candidate } = await getProjectWithCandidate(
    projectId,
    candidateId
  );

  const updated: CandidateCompany = {
    ...candidate,
    reviewStatus,
    updatedAt: new Date().toISOString(),
  };

  return saveCandidate(project, index, updated);
}

export async function reclassifyCandidate(
  projectId: string,
  candidateId: string,
  candidateType: ManualReclassifyType
): Promise<CandidateCompany> {
  const { project, index, candidate } = await getProjectWithCandidate(
    projectId,
    candidateId
  );

  const now = new Date().toISOString();
  const updated: CandidateCompany = {
    ...candidate,
    candidateType: candidateType as CandidateType,
    manuallyOverridden: true,
    manualOverrideAt: now,
    updatedAt: now,
  };

  return saveCandidate(project, index, updated);
}

export async function updateUserNote(
  projectId: string,
  candidateId: string,
  userNote: string
): Promise<CandidateCompany> {
  const { project, index, candidate } = await getProjectWithCandidate(
    projectId,
    candidateId
  );

  const updated: CandidateCompany = {
    ...candidate,
    userNote: userNote.trim() || undefined,
    updatedAt: new Date().toISOString(),
  };

  return saveCandidate(project, index, updated);
}

export async function resetToLlmClassification(
  projectId: string,
  candidateId: string
): Promise<CandidateCompany> {
  const { project, index, candidate } = await getProjectWithCandidate(
    projectId,
    candidateId
  );

  if (!candidate.llmClassification) {
    throw new Error("No LLM classification to reset to");
  }

  const updated: CandidateCompany = {
    ...candidate,
    candidateType: candidate.llmClassification.candidateType,
    manuallyOverridden: false,
    manualOverrideAt: undefined,
    updatedAt: new Date().toISOString(),
  };

  return saveCandidate(project, index, updated);
}
