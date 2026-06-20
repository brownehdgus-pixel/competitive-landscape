import { githubConfig } from "@/lib/env";
import { isLandscapesFile } from "@/lib/landscapesFile";
import {
  DuplicateProjectIdError,
  GitHubStorageError,
  LandscapesFileError,
  ProjectNotFoundError,
} from "@/lib/storage/errors";
import type { LandscapeStorage } from "@/lib/storage/types";
import type { LandscapeProject, LandscapesFile } from "@/types";

const CONFLICT_MESSAGE =
  "Data conflict. Another session may have updated the landscape data. Please refresh and retry.";

type GithubFileReadResult = {
  projects: LandscapeProject[];
  sha?: string;
};

type GithubContentsResponse = {
  content: string;
  sha: string;
  encoding: string;
};

function contentsUrl(): string {
  const { owner, repo, dataPath } = githubConfig;
  return `https://api.github.com/repos/${owner}/${repo}/contents/${dataPath}`;
}

function validateGithubConfig(): void {
  const missing: string[] = [];
  if (!githubConfig.token) missing.push("GITHUB_TOKEN");
  if (!githubConfig.owner) missing.push("GITHUB_OWNER");
  if (!githubConfig.repo) missing.push("GITHUB_REPO");

  if (missing.length > 0) {
    throw new Error(
      `GitHub Storage is not configured. Missing: ${missing.join(", ")}`
    );
  }
}

async function githubFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  validateGithubConfig();

  const headers: HeadersInit = {
    Authorization: `Bearer ${githubConfig.token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(options?.headers as Record<string, string> | undefined),
  };

  return fetch(url, { ...options, headers });
}

function throwGithubApiError(
  status: number,
  context: "read" | "write"
): never {
  switch (status) {
    case 401:
      throw new GitHubStorageError(
        "GitHub token is invalid or expired.",
        401
      );
    case 403:
      throw new GitHubStorageError(
        "GitHub API access denied or rate limit exceeded.",
        403
      );
    case 404:
      if (context === "write") {
        throw new GitHubStorageError(
          "GitHub file path not found. Check GITHUB_OWNER, GITHUB_REPO, GITHUB_DATA_PATH, and GITHUB_BRANCH.",
          404
        );
      }
      throw new GitHubStorageError("GitHub file not found.", 404);
    case 409:
    case 422:
      throw new GitHubStorageError(CONFLICT_MESSAGE, status);
    default:
      throw new GitHubStorageError(`GitHub Storage error: ${status}`, status);
  }
}

async function readGithubFile(): Promise<GithubFileReadResult> {
  const url = `${contentsUrl()}?ref=${encodeURIComponent(githubConfig.branch)}`;
  const response = await githubFetch(url);

  if (response.status === 404) {
    return { projects: [], sha: undefined };
  }

  if (!response.ok) {
    throwGithubApiError(response.status, "read");
  }

  const data = (await response.json()) as GithubContentsResponse;
  const raw = Buffer.from(data.content, "base64").toString("utf-8");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new LandscapesFileError(
      "landscapes.json is corrupted (invalid JSON)",
      error
    );
  }

  if (!isLandscapesFile(parsed)) {
    throw new LandscapesFileError("Invalid landscapes.json structure");
  }

  return { projects: parsed.projects, sha: data.sha };
}

async function writeGithubFile(
  projects: LandscapeProject[],
  message: string,
  sha?: string
): Promise<void> {
  const file: LandscapesFile = { version: 1, projects };
  const content = Buffer.from(`${JSON.stringify(file, null, 2)}\n`).toString(
    "base64"
  );

  const body: Record<string, string> = {
    message,
    content,
    branch: githubConfig.branch,
  };

  if (sha) {
    body.sha = sha;
  }

  const response = await githubFetch(contentsUrl(), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (response.status === 409 || response.status === 422) {
    throw new GitHubStorageError(CONFLICT_MESSAGE, response.status);
  }

  if (!response.ok) {
    throwGithubApiError(response.status, "write");
  }
}

export class GitHubStorage implements LandscapeStorage {
  async getAll(): Promise<LandscapeProject[]> {
    const { projects } = await readGithubFile();
    return [...projects].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    );
  }

  async getById(id: string): Promise<LandscapeProject | null> {
    const { projects } = await readGithubFile();
    return projects.find((project) => project.id === id) ?? null;
  }

  async create(project: LandscapeProject): Promise<LandscapeProject> {
    const { projects, sha } = await readGithubFile();

    if (projects.some((p) => p.id === project.id)) {
      throw new DuplicateProjectIdError(project.id);
    }

    const created = {
      ...project,
      updatedAt: new Date().toISOString(),
    };

    projects.push(created);
    await writeGithubFile(
      projects,
      `Create project: ${created.target.companyName}`,
      sha
    );
    return created;
  }

  async update(
    id: string,
    patch: Partial<LandscapeProject>
  ): Promise<LandscapeProject> {
    const { projects, sha } = await readGithubFile();
    const index = projects.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new ProjectNotFoundError(id);
    }

    const existing = projects[index];
    const updated: LandscapeProject = {
      ...existing,
      ...patch,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    projects[index] = updated;
    await writeGithubFile(
      projects,
      `Update project: ${updated.target.companyName}`,
      sha
    );
    return updated;
  }

  async delete(id: string): Promise<void> {
    const { projects, sha } = await readGithubFile();
    const next = projects.filter((p) => p.id !== id);

    if (next.length === projects.length) {
      throw new ProjectNotFoundError(id);
    }

    await writeGithubFile(next, `Delete project: ${id}`, sha);
  }
}
