import {
  ProjectNotFoundError,
} from "@/lib/storage/errors";
import { landscapeStorage } from "@/lib/storage/landscapeStorage";
export {
  DuplicateProjectIdError,
  LandscapesFileError,
  ProjectNotFoundError,
} from "@/lib/storage/errors";
import type { LandscapeProject } from "@/types";

export async function addProject(project: LandscapeProject): Promise<void> {
  await landscapeStorage.create(project);
}

export async function updateProject(
  id: string,
  updater: (project: LandscapeProject) => LandscapeProject
): Promise<LandscapeProject> {
  const current = await landscapeStorage.getById(id);
  if (!current) {
    throw new ProjectNotFoundError(id);
  }
  const updated = updater({ ...current });
  return landscapeStorage.update(id, updated);
}

export async function deleteProject(id: string): Promise<void> {
  await landscapeStorage.delete(id);
}

export async function resetLandscapesFile(): Promise<void> {
  const storage = landscapeStorage;
  if ("reset" in storage && typeof storage.reset === "function") {
    await (storage as { reset: () => Promise<void> }).reset();
  }
}
