import { NextResponse } from "next/server";
import { recalculateScores } from "@/lib/candidates/classifyService";
import { ProjectNotFoundError } from "@/lib/storage/errors";

type RecalculateRequestBody = {
  projectId?: string;
  candidateIds?: string[];
};

export async function POST(request: Request) {
  let body: RecalculateRequestBody;
  try {
    body = (await request.json()) as RecalculateRequestBody;
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
    const result = await recalculateScores(body.projectId, body.candidateIds);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ProjectNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    const message =
      error instanceof Error ? error.message : "Recalculation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
