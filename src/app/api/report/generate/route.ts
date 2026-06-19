import { NextResponse } from "next/server";
import { requireAdminOrReturn401 } from "@/lib/auth";
import { storageErrorResponse } from "@/lib/api/storageErrorResponse";
import { generateProjectReport } from "@/lib/report/reportService";

type GenerateReportBody = {
  projectId?: string;
  includePendingInAppendix?: boolean;
};

export async function POST(request: Request) {
  const authError = await requireAdminOrReturn401();
  if (authError) return authError;

  let body: GenerateReportBody;
  try {
    body = (await request.json()) as GenerateReportBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.projectId) {
    return NextResponse.json(
      { error: "projectId is required" },
      { status: 400 }
    );
  }

  try {
    const report = await generateProjectReport(body.projectId, {
      includePendingInAppendix: body.includePendingInAppendix ?? false,
    });
    return NextResponse.json(report);
  } catch (error) {
    const storageResponse = storageErrorResponse(error);
    if (storageResponse) return storageResponse;

    const message =
      error instanceof Error ? error.message : "Report generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
