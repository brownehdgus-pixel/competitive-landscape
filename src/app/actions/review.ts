"use server";

import { revalidatePath } from "next/cache";
import {
  reclassifyCandidate,
  resetToLlmClassification,
  updateReviewStatus,
  updateUserNote,
} from "@/lib/candidates/reviewService";
import type { ManualReclassifyType } from "@/lib/candidates/reviewConstants";
import type { ReviewStatus } from "@/types";

function revalidateProject(projectId: string) {
  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
}

export async function updateReviewStatusAction(
  projectId: string,
  candidateId: string,
  reviewStatus: ReviewStatus
) {
  await updateReviewStatus(projectId, candidateId, reviewStatus);
  revalidateProject(projectId);
}

export async function reclassifyCandidateAction(
  projectId: string,
  candidateId: string,
  candidateType: ManualReclassifyType
) {
  await reclassifyCandidate(projectId, candidateId, candidateType);
  revalidateProject(projectId);
}

export async function updateUserNoteAction(
  projectId: string,
  candidateId: string,
  userNote: string
) {
  await updateUserNote(projectId, candidateId, userNote);
  revalidateProject(projectId);
}

export async function resetToLlmClassificationAction(
  projectId: string,
  candidateId: string
) {
  await resetToLlmClassification(projectId, candidateId);
  revalidateProject(projectId);
}
