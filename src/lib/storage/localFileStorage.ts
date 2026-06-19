import {
  createEmptyLandscapesFile,
  isLandscapesFile,
  LANDSCAPES_FILE_PATH,
  readLandscapesFile,
  writeLandscapesFile,
} from "@/lib/landscapesFile";
import {
  DuplicateProjectIdError,
  LandscapesFileError,
  ProjectNotFoundError,
} from "@/lib/storage/errors";
import type { LandscapeStorage } from "@/lib/storage/types";
import type { LandscapeProject } from "@/types";

export class LocalFileStorage implements LandscapeStorage {
  async getAll(): Promise<LandscapeProject[]> {
    const file = await readLandscapesFile();
    return [...file.projects].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    );
  }

  async getById(id: string): Promise<LandscapeProject | null> {
    const file = await readLandscapesFile();
    return file.projects.find((project) => project.id === id) ?? null;
  }

  async create(project: LandscapeProject): Promise<LandscapeProject> {
    const file = await readLandscapesFile();
    if (file.projects.some((p) => p.id === project.id)) {
      throw new DuplicateProjectIdError(project.id);
    }
    const created = {
      ...project,
      updatedAt: new Date().toISOString(),
    };
    file.projects.push(created);
    await writeLandscapesFile(file);
    return created;
  }

  async update(
    id: string,
    patch: Partial<LandscapeProject>
  ): Promise<LandscapeProject> {
    const file = await readLandscapesFile();
    const index = file.projects.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new ProjectNotFoundError(id);
    }
    const existing = file.projects[index];
    const updated: LandscapeProject = {
      ...existing,
      ...patch,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    file.projects[index] = updated;
    await writeLandscapesFile(file);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const file = await readLandscapesFile();
    const next = file.projects.filter((p) => p.id !== id);
    if (next.length === file.projects.length) {
      throw new ProjectNotFoundError(id);
    }
    file.projects = next;
    await writeLandscapesFile(file);
  }

  /** 검증·테스트 전용 — 프로덕션 UI에서 사용하지 않음 */
  async reset(): Promise<void> {
    await writeLandscapesFile(createEmptyLandscapesFile());
  }

  getFilePath(): string {
    return LANDSCAPES_FILE_PATH;
  }
}

export function assertValidLandscapesFile(value: unknown): void {
  if (!isLandscapesFile(value)) {
    throw new LandscapesFileError("Invalid landscapes.json structure");
  }
}
