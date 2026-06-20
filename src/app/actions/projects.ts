"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminOrThrow } from "@/lib/auth";
import { createLandscapeProject } from "@/lib/factories";
import { landscapeStorage } from "@/lib/storage/landscapeStorage";
import { withStorageError } from "@/lib/storage/withStorageError";
import type { AnalysisPurpose } from "@/types";

const ANALYSIS_PURPOSES: AnalysisPurpose[] = [
  "Tech-Special Listing",
  "VC Investment Review",
  "Both",
];

function parseAnalysisPurpose(value: string): AnalysisPurpose {
  if (ANALYSIS_PURPOSES.includes(value as AnalysisPurpose)) {
    return value as AnalysisPurpose;
  }
  return "Both";
}

export async function createProjectAction(formData: FormData) {
  await requireAdminOrThrow();

  const companyName = String(formData.get("companyName") ?? "").trim();
  if (!companyName) {
    throw new Error("Company name is required");
  }

  const project = createLandscapeProject({
    companyName,
    website: String(formData.get("website") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? "").trim() || undefined,
    coreTechnology:
      String(formData.get("coreTechnology") ?? "").trim() || undefined,
    productOrService:
      String(formData.get("productOrService") ?? "").trim() || undefined,
    indicationOrMarket:
      String(formData.get("indicationOrMarket") ?? "").trim() || undefined,
    customerGroup:
      String(formData.get("customerGroup") ?? "").trim() || undefined,
    businessModel:
      String(formData.get("businessModel") ?? "").trim() || undefined,
    developmentStage:
      String(formData.get("developmentStage") ?? "").trim() || undefined,
    analysisPurpose: parseAnalysisPurpose(
      String(formData.get("analysisPurpose") ?? "Both")
    ),
  });

  await withStorageError(() => landscapeStorage.create(project));
  revalidatePath("/");
  redirect(`/projects/${project.id}`);
}

export async function deleteProjectAction(id: string) {
  await requireAdminOrThrow();

  await withStorageError(() => landscapeStorage.delete(id));
  revalidatePath("/");
}
