"use server";

import { revalidatePath } from "next/cache";
import { requireAdminOrThrow } from "@/lib/auth";
import { generateProjectReport } from "@/lib/report/reportService";

function revalidateProject(projectId: string) {
  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/report`);
}

export async function generateReportAction(
  projectId: string,
  includePendingInAppendix: boolean
) {
  await requireAdminOrThrow();

  await generateProjectReport(projectId, { includePendingInAppendix });
  revalidateProject(projectId);
}
