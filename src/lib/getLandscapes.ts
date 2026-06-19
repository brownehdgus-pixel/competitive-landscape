import { landscapeStorage } from "@/lib/storage/landscapeStorage";
import type { LandscapeProject } from "@/types";

/**
 * 모든 Landscape 프로젝트를 불러옵니다.
 * landscapeStorage 단일 진입점을 통해 접근합니다.
 */
export async function getAllProjects(): Promise<LandscapeProject[]> {
  return landscapeStorage.getAll();
}

export async function getProjectById(
  id: string
): Promise<LandscapeProject | null> {
  return landscapeStorage.getById(id);
}
