"use server";

import { revalidatePath } from "next/cache";
import { requireAdminOrThrow } from "@/lib/auth";
import {
  addEvidence,
  createCandidate,
  deleteCandidate,
  deleteEvidence,
  updateCandidate,
} from "@/lib/candidates/candidateService";
import { withStorageError } from "@/lib/storage/withStorageError";

function revalidateProject(projectId: string) {
  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
}

export async function createCandidateAction(
  projectId: string,
  formData: FormData
) {
  await requireAdminOrThrow();

  await withStorageError(() => createCandidate(projectId, formData));
  revalidateProject(projectId);
}

export async function updateCandidateAction(
  projectId: string,
  candidateId: string,
  formData: FormData
) {
  await requireAdminOrThrow();

  await withStorageError(() =>
    updateCandidate(projectId, candidateId, formData)
  );
  revalidateProject(projectId);
}

export async function deleteCandidateAction(
  projectId: string,
  candidateId: string
) {
  await requireAdminOrThrow();

  await withStorageError(() => deleteCandidate(projectId, candidateId));
  revalidateProject(projectId);
}

export async function addEvidenceAction(
  projectId: string,
  candidateId: string,
  formData: FormData
) {
  await requireAdminOrThrow();

  await withStorageError(() => addEvidence(projectId, candidateId, formData));
  revalidateProject(projectId);
}

export async function deleteEvidenceAction(
  projectId: string,
  candidateId: string,
  evidenceId: string
) {
  await requireAdminOrThrow();

  await withStorageError(() =>
    deleteEvidence(projectId, candidateId, evidenceId)
  );
  revalidateProject(projectId);
}
