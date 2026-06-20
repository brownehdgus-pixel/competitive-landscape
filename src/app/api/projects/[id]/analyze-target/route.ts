import { NextResponse } from "next/server";
import { requireAdminOrReturn401 } from "@/lib/auth";
import { storageOrGenericErrorResponse } from "@/lib/api/storageErrorResponse";
import { analyzeTargetProject } from "@/lib/target/analyzeTargetService";
import {
  OpenAIClientError,
  OpenAIRateLimitError,
} from "@/lib/openai/errors";
import { ProjectNotFoundError } from "@/lib/storage/errors";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const authError = await requireAdminOrReturn401();
  if (authError) return authError;

  const { id } = await context.params;

  let body: { website?: string } = {};
  try {
    body = (await _request.json()) as { website?: string };
  } catch {
    // empty body is fine
  }

  try {
    const result = await analyzeTargetProject(id, {
      website: body.website,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ProjectNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof OpenAIRateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    if (error instanceof OpenAIClientError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return storageOrGenericErrorResponse(error, "Target analysis failed");
  }
}
