import { NextResponse } from "next/server";
import {
  GitHubStorageError,
  ProjectNotFoundError,
} from "@/lib/storage/errors";

export function storageErrorResponse(error: unknown): NextResponse | null {
  if (error instanceof GitHubStorageError) {
    const status =
      error.statusCode === 409 || error.statusCode === 422
        ? 409
        : error.statusCode === 401 || error.statusCode === 403
          ? 502
          : 500;

    return NextResponse.json({ error: error.message }, { status });
  }

  if (error instanceof ProjectNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return null;
}
