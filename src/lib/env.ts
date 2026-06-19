export type StorageDriver = "local" | "github";

export const storageDriver: StorageDriver =
  process.env.STORAGE_DRIVER === "github" ? "github" : "local";

export const adminConfig = {
  password: process.env.ADMIN_PASSWORD ?? "",
  cookieName: process.env.AUTH_COOKIE_NAME ?? "clb_admin",
};

export const githubConfig = {
  token: process.env.GITHUB_TOKEN ?? "",
  owner: process.env.GITHUB_OWNER ?? "",
  repo: process.env.GITHUB_REPO ?? "",
  branch: process.env.GITHUB_BRANCH ?? "main",
  dataPath: process.env.GITHUB_DATA_PATH ?? "data/landscapes.json",
};

export function assertGithubConfig(): void {
  if (!githubConfig.token) {
    throw new Error("GITHUB_TOKEN is not configured.");
  }
  if (!githubConfig.owner) {
    throw new Error("GITHUB_OWNER is not configured.");
  }
  if (!githubConfig.repo) {
    throw new Error("GITHUB_REPO is not configured.");
  }
}
