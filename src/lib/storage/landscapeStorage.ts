import { LocalFileStorage } from "@/lib/storage/localFileStorage";
import type { LandscapeStorage } from "@/lib/storage/types";

let storageInstance: LandscapeStorage | null = null;

/**
 * v0.1: LocalFileStorage (data/landscapes.json)
 * v0.1.5+: STORAGE_DRIVER env에 따라 GitHub adapter 반환 예정
 */
export function getLandscapeStorage(): LandscapeStorage {
  if (!storageInstance) {
    storageInstance = new LocalFileStorage();
  }
  return storageInstance;
}

/** 앱 전역 단일 저장소 진입점 */
export const landscapeStorage = getLandscapeStorage();

export function resetLandscapeStorageForTests(): void {
  storageInstance = new LocalFileStorage();
}
