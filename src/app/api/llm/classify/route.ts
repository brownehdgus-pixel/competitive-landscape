import { NextResponse } from "next/server";
import {
  classifyCandidates,
  MAX_CLASSIFY_BATCH,
} from "@/lib/candidates/classifyService";
import { ProjectNotFoundError } from "@/lib/storage/errors";

type ClassifyRequestBody = {
  projectId?: string;
  candidateIds?: string[];
  unclassifiedOnly?: boolean;
};

export async function POST(request: Request) {
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
    if (error instanceof ProjectNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    const message =
      error instanceof Error ? error.message : "Classification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
