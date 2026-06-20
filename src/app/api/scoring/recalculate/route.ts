import { NextResponse } from "next/server";
import { requireAdminOrReturn401 } from "@/lib/auth";
import { storageOrGenericErrorResponse } from "@/lib/api/storageErrorResponse";
import { recalculateScores } from "@/lib/candidates/classifyService";

type RecalculateRequestBody = {
  projectId?: string;
  candidateIds?: string[];
};

export async function POST(request: Request) {
  const authError = await requireAdminOrReturn401();
  if (authError) return authError;

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
    return storageOrGenericErrorResponse(error, "Recalculation failed");
  }
}
