import { NextResponse } from "next/server";
import { requireAdminOrReturn401 } from "@/lib/auth";
import { storageErrorResponse } from "@/lib/api/storageErrorResponse";
import {
  classifyCandidates,
  MAX_CLASSIFY_BATCH,
} from "@/lib/candidates/classifyService";

type ClassifyRequestBody = {
  projectId?: string;
  candidateIds?: string[];
  unclassifiedOnly?: boolean;
};

export async function POST(request: Request) {
  const authError = await requireAdminOrReturn401();
  if (authError) return authError;

  let body: ClassifyRequestBody;
  try {
    body = (await request.json()) as ClassifyRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { projectId, candidateIds, unclassifiedOnly } = body;

  if (!projectId) {
    return NextResponse.json(
      { error: "projectId is required" },
      { status: 400 }
    );
  }

  if (candidateIds && candidateIds.length > MAX_CLASSIFY_BATCH) {
    return NextResponse.json(
      {
        error: `Maximum ${MAX_CLASSIFY_BATCH} candidates per batch`,
      },
      { status: 400 }
    );
  }

  try {
    const result = await classifyCandidates(projectId, {
      candidateIds,
      unclassifiedOnly: unclassifiedOnly ?? true,
    });

    return NextResponse.json(result);
  } catch (error) {
    const storageResponse = storageErrorResponse(error);
    if (storageResponse) return storageResponse;

    const message =
      error instanceof Error ? error.message : "Classification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
