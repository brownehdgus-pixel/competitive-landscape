import { storageDriver } from "@/lib/env";
import { GitHubStorage } from "@/lib/storage/githubStorage";
import { LocalFileStorage } from "@/lib/storage/localFileStorage";
import type { LandscapeStorage } from "@/lib/storage/types";

let storageInstance: LandscapeStorage | null = null;

function createStorage(): LandscapeStorage {
  return storageDriver === "github"
    ? new GitHubStorage()
    : new LocalFileStorage();
}

export function getLandscapeStorage(): LandscapeStorage {
  if (!storageInstance) {
    storageInstance = createStorage();
  }
  return storageInstance;
}

/** 앱 전역 단일 저장소 진입점 */
export const landscapeStorage = getLandscapeStorage();

export function resetLandscapeStorageForTests(): void {
  storageInstance = new LocalFileStorage();
}
