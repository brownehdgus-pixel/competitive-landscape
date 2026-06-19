"use server";

import { revalidatePath } from "next/cache";
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
  await generateProjectReport(projectId, { includePendingInAppendix });
  revalidateProject(projectId);
}
