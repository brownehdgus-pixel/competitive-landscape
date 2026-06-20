"use server";

import { revalidatePath } from "next/cache";
import { requireAdminOrThrow } from "@/lib/auth";
import {
  reclassifyCandidate,
  resetToLlmClassification,
  updateReviewStatus,
  updateUserNote,
} from "@/lib/candidates/reviewService";
import type { ManualReclassifyType } from "@/lib/candidates/reviewConstants";
import { withStorageError } from "@/lib/storage/withStorageError";
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
  await requireAdminOrThrow();

  await withStorageError(() =>
    updateReviewStatus(projectId, candidateId, reviewStatus)
  );
  revalidateProject(projectId);
}

export async function reclassifyCandidateAction(
  projectId: string,
  candidateId: string,
  candidateType: ManualReclassifyType
) {
  await requireAdminOrThrow();

  await withStorageError(() =>
    reclassifyCandidate(projectId, candidateId, candidateType)
  );
  revalidateProject(projectId);
}

export async function updateUserNoteAction(
  projectId: string,
  candidateId: string,
  userNote: string
) {
  await requireAdminOrThrow();

  await withStorageError(() =>
    updateUserNote(projectId, candidateId, userNote)
  );
  revalidateProject(projectId);
}

export async function resetToLlmClassificationAction(
  projectId: string,
  candidateId: string
) {
  await requireAdminOrThrow();

  await withStorageError(() =>
    resetToLlmClassification(projectId, candidateId)
  );
  revalidateProject(projectId);
}
