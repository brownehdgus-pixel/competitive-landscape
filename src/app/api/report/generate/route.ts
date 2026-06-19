import { NextResponse } from "next/server";
import { generateProjectReport } from "@/lib/report/reportService";
import { ProjectNotFoundError } from "@/lib/storage/errors";

type GenerateReportBody = {
  projectId?: string;
  includePendingInAppendix?: boolean;
};

export async function POST(request: Request) {
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
    if (error instanceof ProjectNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    const message =
      error instanceof Error ? error.message : "Report generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
