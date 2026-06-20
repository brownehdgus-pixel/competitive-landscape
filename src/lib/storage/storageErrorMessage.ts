import { GitHubStorageError } from "@/lib/storage/errors";

export const GITHUB_403_MESSAGE =
  "GitHub API access denied. Check that GITHUB_TOKEN has Contents: Read and write permission for the competitive-landscape repository.";

function getErrorStatusCode(error: unknown): number | undefined {
  if (error instanceof GitHubStorageError) {
    return error.statusCode;
  }
  if (error && typeof error === "object" && "statusCode" in error) {
    const code = (error as { statusCode?: unknown }).statusCode;
    return typeof code === "number" ? code : undefined;
  }
  return undefined;
}

export function isGitHubStorageError(error: unknown): boolean {
  return (
    error instanceof GitHubStorageError ||
    (error instanceof Error && error.name === "GitHubStorageError")
  );
}

export function getStorageErrorMessage(error: unknown): string {
  const statusCode = getErrorStatusCode(error);

  if (statusCode === 403) {
    return GITHUB_403_MESSAGE;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Storage error";
}
