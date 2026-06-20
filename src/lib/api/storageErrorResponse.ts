import { NextResponse } from "next/server";
import {
  GitHubStorageError,
  ProjectNotFoundError,
} from "@/lib/storage/errors";
import {
  getStorageErrorMessage,
  isGitHubStorageError,
} from "@/lib/storage/storageErrorMessage";

function storageHttpStatus(error: unknown): number {
  if (error instanceof GitHubStorageError) {
    if (error.statusCode === 409 || error.statusCode === 422) return 409;
    if (error.statusCode === 401 || error.statusCode === 403) return 502;
  }

  if (isGitHubStorageError(error)) {
    const statusCode =
      error instanceof GitHubStorageError
        ? error.statusCode
        : error && typeof error === "object" && "statusCode" in error
          ? (error as { statusCode?: number }).statusCode
          : undefined;

    if (statusCode === 409 || statusCode === 422) return 409;
    if (statusCode === 401 || statusCode === 403) return 502;
  }

  return 500;
}

export function storageErrorResponse(error: unknown): NextResponse | null {
  if (error instanceof ProjectNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  if (isGitHubStorageError(error)) {
    return NextResponse.json(
      { error: getStorageErrorMessage(error) },
      { status: storageHttpStatus(error) }
    );
  }

  return null;
}

export function storageOrGenericErrorResponse(
  error: unknown,
  fallback: string
): NextResponse {
  const storageResponse = storageErrorResponse(error);
  if (storageResponse) return storageResponse;

  return NextResponse.json(
    { error: getStorageErrorMessage(error) || fallback },
    { status: 500 }
  );
}
